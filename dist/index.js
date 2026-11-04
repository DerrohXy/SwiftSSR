import * as fs from "node:fs";
import * as path from "node:path";
import { Readable, pipeline } from "node:stream";
import { NODE_BRAND } from "./types.js";
const DEFAULT_URL_SCHEMES = ["http", "https", "mailto", "tel", "sms"];
const config = { implicitLoad: true, allowedUrlSchemes: DEFAULT_URL_SCHEMES };
let scriptsRootCache;
const fileCache = new Map();
export function Configure(options) {
    if (options.scriptsRoot !== undefined)
        config.scriptsRoot = options.scriptsRoot;
    if (options.cacheFiles !== undefined)
        config.cacheFiles = options.cacheFiles;
    if (options.implicitLoad !== undefined)
        config.implicitLoad = options.implicitLoad;
    if (options.allowedUrlSchemes !== undefined) {
        config.allowedUrlSchemes = options.allowedUrlSchemes.map((s) => s.toLowerCase().replace(/:$/, ""));
    }
    scriptsRootCache = undefined;
    fileCache.clear();
}
function isProduction() {
    return (typeof process !== "undefined" && process.env?.NODE_ENV === "production");
}
function warn(message) {
    if (!isProduction())
        console.warn(`[swift-ssr] ${message}`);
}
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const VOID_ELEMENTS = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);
// Tags whose content is code, not visible text. Children are trusted/raw and
// guarded against closing their own tag early.
const CODE_TAGS = new Set(["script", "style"]);
const CODE_GUARDS = {
    script: /<\/(script)/gi,
    style: /<\/(style)/gi,
};
// The HTML parser drops one leading newline inside these, so we re-add it.
const LEADING_NEWLINE_TAGS = new Set(["pre", "textarea", "listing"]);
// Presence-based attributes: `disabled="false"` is still disabled in HTML.
const BOOLEAN_ATTRS = new Set([
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "hidden",
    "inert",
    "ismap",
    "itemscope",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "popover",
    "readonly",
    "required",
    "reversed",
    "selected",
]);
// Enumerated attributes where "false" is meaningful and must be rendered.
const ENUMERATED_ATTRS = new Set([
    "contenteditable",
    "draggable",
    "spellcheck",
]);
const URL_ATTRS = new Set([
    "href",
    "src",
    "action",
    "formaction",
    "poster",
    "cite",
    "data",
    "background",
    "manifest",
    "xlink:href",
]);
const UNITLESS_STYLES = new Set([
    "opacity",
    "zIndex",
    "flex",
    "flexGrow",
    "flexShrink",
    "fontWeight",
    "lineHeight",
    "order",
    "zoom",
    "aspectRatio",
    "orphans",
    "widows",
]);
const SKIPPED_PROPS = new Set(["children", "key", "ref", "attrs"]);
// Aliases use a Map (not an object) so keys like "constructor" can't hit
// Object.prototype.
const ATTR_ALIASES = new Map([
    ["htmlFor", "for"],
    ["tabIndex", "tabindex"],
    ["httpEquiv", "http-equiv"],
    ["acceptCharset", "accept-charset"],
    ["xlinkHref", "xlink:href"],
]);
for (const camel of [
    "strokeWidth",
    "strokeLinecap",
    "strokeLinejoin",
    "strokeDasharray",
    "strokeDashoffset",
    "strokeOpacity",
    "strokeMiterlimit",
    "fillOpacity",
    "fillRule",
    "clipRule",
    "clipPath",
    "stopColor",
    "stopOpacity",
    "textAnchor",
    "dominantBaseline",
    "vectorEffect",
]) {
    ATTR_ALIASES.set(camel, toKebabCase(camel));
}
// Anything except whitespace, quotes, <, >, /, = and control characters.
const VALID_ATTR_NAME = /^[^\s"'<>\/=\u0000-\u001f\u007f]+$/;
const VALID_TAG_NAME = /^[A-Za-z][A-Za-z0-9:_.-]*$/;
// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------
function toKebabCase(text) {
    return text
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
}
const ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};
const NEEDS_ESCAPE = /[&<>"']/;
const ESCAPE_ALL = /[&<>"']/g;
export function EscapeHTML(text) {
    const str = String(text);
    return NEEDS_ESCAPE.test(str)
        ? str.replace(ESCAPE_ALL, (c) => ESCAPES[c])
        : str;
}
export function classNames(...args) {
    const classes = [];
    for (const arg of args) {
        if (!arg)
            continue;
        if (typeof arg === "string" || typeof arg === "number") {
            classes.push(String(arg));
        }
        else if (Array.isArray(arg)) {
            const inner = classNames(...arg);
            if (inner)
                classes.push(inner);
        }
        else if (typeof arg === "object") {
            for (const [key, value] of Object.entries(arg)) {
                if (value)
                    classes.push(key);
            }
        }
    }
    return classes.join(" ");
}
// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------
/** True only for nodes created by this library (not for look-alike JSON). */
export function IsSwiftSSRNode(value) {
    return (typeof value === "object" &&
        value !== null &&
        value[NODE_BRAND] === true);
}
function TextNode(value, raw = false) {
    return { [NODE_BRAND]: true, kind: "text", value, raw };
}
/**
 * Wrap a string as trusted markup that `Render` inserts verbatim. Never wrap
 * raw user input in `RawHTML`.
 */
export function RawHTML(value) {
    return TextNode(value, true);
}
function collectChildren(out, child) {
    if (child === null || child === undefined || typeof child === "boolean") {
        return;
    }
    if (typeof child === "string" ||
        typeof child === "number" ||
        typeof child === "bigint") {
        // Plain text is escaped when rendered.
        out.push(TextNode(String(child)));
        return;
    }
    if (Array.isArray(child)) {
        for (const c of child)
            collectChildren(out, c);
        return;
    }
    if (IsSwiftSSRNode(child)) {
        if (child.kind === "fragment")
            out.push(...child.children);
        else
            out.push(child);
        return;
    }
    throw new TypeError(`swift-ssr: invalid child of type "${typeof child}"` +
        (typeof child.then === "function"
            ? " (a Promise - did you forget to await?)"
            : " (plain objects are not renderable; use RawHTML() for trusted markup)"));
}
// ---------------------------------------------------------------------------
// Embedded files (sandboxed, cached)
// ---------------------------------------------------------------------------
function resolveScriptsRoot() {
    if (scriptsRootCache !== undefined)
        return scriptsRootCache;
    scriptsRootCache = null;
    try {
        const cwd = process.cwd();
        let configured = config.scriptsRoot;
        if (!configured) {
            const packageJsonPath = path.join(cwd, "package.json");
            if (fs.existsSync(packageJsonPath)) {
                const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
                configured = pkg.swiftSSRScriptsRoot || pkg.SwiftSSRScriptsRoot;
            }
        }
        if (configured && typeof configured === "string") {
            // realpath so a symlinked root is compared consistently below
            scriptsRootCache = fs.realpathSync(path.resolve(cwd, configured));
        }
    }
    catch {
        scriptsRootCache = null;
    }
    return scriptsRootCache;
}
function isInside(root, target) {
    const rel = path.relative(root, target);
    return (rel !== "" &&
        rel !== ".." &&
        !rel.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(rel));
}
/**
 * Reads a file sandboxed to the scripts root. Rejects absolute paths, NUL
 * bytes, `..` escapes and symlinks pointing outside the root. Returns null on
 * any failure.
 */
export function LoadEmbeddedFile(embeddedPath) {
    try {
        if (typeof embeddedPath !== "string" ||
            embeddedPath.length === 0 ||
            embeddedPath.includes("\0") ||
            path.isAbsolute(embeddedPath)) {
            return null;
        }
        const root = resolveScriptsRoot();
        if (!root)
            return null;
        // realpath resolves symlinks, so a link inside the root that points
        // outside it is rejected by the check below.
        const real = fs.realpathSync(path.resolve(root, embeddedPath));
        if (!isInside(root, real))
            return null;
        const useCache = config.cacheFiles ?? isProduction();
        if (useCache) {
            const hit = fileCache.get(real);
            if (hit !== undefined)
                return hit;
        }
        if (!fs.statSync(real).isFile())
            return null;
        const content = fs.readFileSync(real, "utf8");
        if (useCache)
            fileCache.set(real, content);
        return content;
    }
    catch {
        return null;
    }
}
function extractEmbeddedLoadPath(value) {
    const match = value.match(/^LOAD\("(.+)"\)$/);
    return match ? match[1] : null;
}
export function loadEmbeddedFileTemplate(content) {
    const loadingPath = extractEmbeddedLoadPath(content);
    return loadingPath ? LoadEmbeddedFile(loadingPath) : null;
}
function resolveCodeText(value) {
    if (config.implicitLoad) {
        const loadPath = extractEmbeddedLoadPath(value.trim());
        if (loadPath) {
            const loaded = LoadEmbeddedFile(loadPath);
            if (loaded !== null)
                return loaded;
            warn(`LOAD("${loadPath}") could not be resolved inside the scripts root.`);
        }
    }
    return value;
}
// ---------------------------------------------------------------------------
// Attributes
// ---------------------------------------------------------------------------
/** True if `value` is a relative URL or uses an allowed scheme. */
export function IsSafeURL(value) {
    // Browsers ignore control characters/whitespace inside the scheme
    // ("java\tscript:"), so normalise before inspecting it.
    const normalized = value
        .replace(/[\u0000-\u0020\u007f-\u009f\u2028\u2029]/g, "")
        .toLowerCase();
    const match = /^([a-z][a-z0-9+.\-]*):/.exec(normalized);
    if (!match)
        return true;
    if (config.allowedUrlSchemes.includes(match[1]))
        return true;
    if (match[1] === "data") {
        return /^data:image\/(png|gif|jpe?g|webp|avif|bmp|x-icon)[;,]/.test(normalized);
    }
    return false;
}
function styleName(key) {
    if (key.startsWith("--"))
        return key; // custom property: case-sensitive
    const kebab = toKebabCase(key);
    // WebkitTransition -> -webkit-transition, msTransform -> -ms-transform
    return /^(webkit|moz|ms|o)-/.test(kebab) ? `-${kebab}` : kebab;
}
function formatStyle(style) {
    const declarations = [];
    for (const [key, value] of Object.entries(style)) {
        if (value === null ||
            value === undefined ||
            value === false ||
            value === "") {
            continue;
        }
        let text;
        if (typeof value === "number") {
            text =
                value === 0 || key.startsWith("--") || UNITLESS_STYLES.has(key)
                    ? String(value)
                    : `${value}px`;
        }
        else {
            text = String(value);
        }
        declarations.push(`${styleName(key)}:${text}`);
    }
    return declarations.join("; ");
}
function formatProps(props, xml) {
    const source = props.attrs
        ? { ...props, ...props.attrs }
        : props;
    const parts = [];
    const classes = [];
    let classSlot = -1;
    for (const [rawKey, value] of Object.entries(source)) {
        if (SKIPPED_PROPS.has(rawKey))
            continue;
        // `class` and `className` are merged into one attribute.
        if (rawKey === "class" || rawKey === "className") {
            if (classSlot < 0) {
                classSlot = parts.length;
                parts.push("");
            }
            classes.push(value);
            continue;
        }
        if (value === null ||
            value === undefined ||
            typeof value === "function" ||
            typeof value === "symbol") {
            continue;
        }
        const name = ATTR_ALIASES.get(rawKey) ?? rawKey;
        if (!VALID_ATTR_NAME.test(name)) {
            warn(`Skipped attribute with invalid name: ${JSON.stringify(name)}`);
            continue;
        }
        if (name === "style") {
            const css = typeof value === "string"
                ? value
                : typeof value === "object"
                    ? formatStyle(value)
                    : "";
            if (css)
                parts.push(`style="${EscapeHTML(css)}"`);
            continue;
        }
        if (typeof value === "object")
            continue; // unsupported value type
        const lname = name.toLowerCase();
        if (!xml && BOOLEAN_ATTRS.has(lname)) {
            if (value === true ||
                value === "" ||
                value === "true" ||
                (typeof value === "number" && value !== 0)) {
                parts.push(name);
            }
            else if (value === false || value === "false" || value === 0) {
                // omitted
            }
            else {
                // e.g. hidden="until-found", popover="manual"
                parts.push(`${name}="${EscapeHTML(value)}"`);
            }
            continue;
        }
        if (typeof value === "boolean") {
            if (xml ||
                ENUMERATED_ATTRS.has(lname) ||
                lname.startsWith("aria-") ||
                lname.startsWith("data-")) {
                parts.push(`${name}="${value}"`);
            }
            else if (value) {
                parts.push(name);
            }
            continue;
        }
        const text = String(value);
        if (URL_ATTRS.has(lname) && !IsSafeURL(text)) {
            warn(`Blocked unsafe URL in "${name}" attribute.`);
            continue;
        }
        parts.push(`${name}="${EscapeHTML(text)}"`);
    }
    if (classSlot >= 0) {
        const resolved = classNames(...classes);
        parts[classSlot] = resolved ? `class="${EscapeHTML(resolved)}"` : "";
    }
    return parts.filter(Boolean).join(" ");
}
// ---------------------------------------------------------------------------
// Element creation
// ---------------------------------------------------------------------------
function createNode(tag, props, children) {
    if (!VALID_TAG_NAME.test(tag)) {
        throw new TypeError(`swift-ssr: invalid tag name ${JSON.stringify(tag)}`);
    }
    const flat = [];
    for (const child of children)
        collectChildren(flat, child);
    let restProps = props;
    if (props && props.children !== undefined) {
        collectChildren(flat, props.children);
        const { children: _omit, ...rest } = props;
        restProps = rest;
    }
    const finalChildren = CODE_TAGS.has(tag.toLowerCase())
        ? flat.map((child) => child.kind === "text" && !child.raw
            ? RawHTML(resolveCodeText(child.value))
            : child)
        : flat;
    return {
        [NODE_BRAND]: true,
        kind: "element",
        tag,
        props: restProps ?? null,
        children: finalChildren,
    };
}
/**
 * Builds an element node. Does NOT return a string - call `Render()`.
 * String/number children are escaped; wrap trusted markup in `RawHTML(...)`.
 * Throws on objects that aren't nodes (e.g. a forgotten `await`).
 */
export function Element(tag, props, ...children) {
    return createNode(tag, props, children);
}
/** Like `Element` but for XML vocabularies (sitemaps, RSS, ...).
 * Use with `Render(node, { xml: true })`.
 * */
export function XmlElement(tag, props, ...children) {
    return createNode(tag, props, children);
}
/** Children with no wrapper element (what `<>...</>` compiles to). */
export function Fragment(props) {
    const children = [];
    collectChildren(children, props?.children);
    const node = {
        [NODE_BRAND]: true,
        kind: "fragment",
        children,
    };
    return node;
}
function* walk(node, xml) {
    if (node.kind === "text") {
        yield node.raw ? node.value : EscapeHTML(node.value);
        return;
    }
    if (node.kind === "fragment") {
        for (const child of node.children)
            yield* walk(child, xml);
        return;
    }
    const { tag, props, children } = node;
    const attrs = props ? formatProps(props, xml) : "";
    const open = attrs ? `<${tag} ${attrs}` : `<${tag}`;
    const lower = tag.toLowerCase();
    if (!xml && VOID_ELEMENTS.has(lower)) {
        yield `${open}>`;
        return;
    }
    if (xml && children.length === 0) {
        yield `${open}/>`;
        return;
    }
    yield `${open}>`;
    if (!xml && LEADING_NEWLINE_TAGS.has(lower)) {
        const first = children[0];
        if (first && first.kind === "text" && first.value.startsWith("\n")) {
            yield "\n";
        }
    }
    const guard = !xml && CODE_TAGS.has(lower) ? CODE_GUARDS[lower] : null;
    for (const child of children) {
        if (guard && child.kind === "text") {
            // trusted code must not be able to close its own tag early
            yield child.value.replace(guard, "<\\/$1");
        }
        else {
            yield* walk(child, xml);
        }
    }
    yield `</${tag}>`;
}
function* walkAll(node, xml) {
    if (!node)
        return;
    if (Array.isArray(node)) {
        for (const n of node)
            yield* walk(n, xml);
    }
    else {
        yield* walk(node, xml);
    }
}
/** Serializes a node (or list of nodes) into a string. */
export function Render(node, options = {}) {
    let html = "";
    for (const chunk of walkAll(node, !!options.xml))
        html += chunk;
    return html;
}
const CHUNK_SIZE = 16 * 1024;
/**
 * Streaming render. Returns a Readable, so backpressure is handled by Node:
 * `RenderToReadable(node).pipe(res)`.
 */
export function RenderToReadable(node, options = {}) {
    function* chunks() {
        let buffer = options.doctype ? "<!DOCTYPE html>\n" : "";
        for (const piece of walkAll(node, !!options.xml)) {
            buffer += piece;
            if (buffer.length >= CHUNK_SIZE) {
                yield buffer;
                buffer = "";
            }
        }
        if (buffer)
            yield buffer;
    }
    return Readable.from(chunks(), { objectMode: false });
}
/** Express/http helper: send a finished HTML string. */
export function SendHTML(res, html, status = 200) {
    res.statusCode = status;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Length", Buffer.byteLength(html));
    res.end(html);
}
/** Express/http helper: stream a node tree (e.g. from `DocumentNode`) to the response. */
export function StreamHTML(res, node, options = {}) {
    res.statusCode = options.status ?? 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    pipeline(RenderToReadable(node, { doctype: options.doctype ?? true }), res, () => {
        // pipeline destroys both streams on error; nothing else to do
    });
}
// ---------------------------------------------------------------------------
// Embedded code helpers
// ---------------------------------------------------------------------------
export function EmbeddedJS(code, props) {
    return Element("script", props ?? null, code);
}
export function EmbeddedCSS(code, props) {
    return Element("style", props ?? null, code);
}
function loadOrThrow(file) {
    const code = LoadEmbeddedFile(file);
    if (code === null) {
        throw new Error(`swift-ssr: could not load "${file}" (check the scripts root and the path)`);
    }
    return code;
}
/** Explicit alternative to `LOAD("...")`: inline a file from the scripts root. */
export function LoadJS(file, props) {
    return Element("script", props ?? null, RawHTML(loadOrThrow(file)));
}
export function LoadCSS(file, props) {
    return Element("style", props ?? null, RawHTML(loadOrThrow(file)));
}
/**
 * Embed data for client code: `<script type="application/json" id="...">`.
 * `<`, `>`, `&` and U+2028/9 are escaped so the payload can't break out.
 */
export function JsonScript(data, props) {
    const json = (JSON.stringify(data) ?? "null")
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");
    return Element("script", { type: "application/json", ...props }, RawHTML(json));
}
/** Builds the full <html> tree. Pair with `StreamHTML` to stream it. */
export function DocumentNode(params) {
    const headNodes = [];
    collectChildren(headNodes, params.head);
    const has = (tag, test) => headNodes.some((n) => n.kind === "element" &&
        n.tag === tag &&
        (!test || (n.props !== null && test(n.props))));
    const defaults = [];
    if (!has("meta", (p) => p.charset !== undefined)) {
        defaults.push(Element("meta", { charset: "UTF-8" }));
    }
    if (!has("meta", (p) => p.name === "viewport")) {
        defaults.push(Element("meta", {
            name: "viewport",
            content: "width=device-width, initial-scale=1.0",
        }));
    }
    if (!has("title")) {
        defaults.push(Element("title", null, params.title || "Generated Page"));
    }
    return Element("html", { lang: params.lang || "en", ...params.htmlProps }, Element("head", null, defaults, headNodes), Element("body", params.bodyProps ?? null, params.body));
}
export function Document(params) {
    return `<!DOCTYPE html>\n${Render(DocumentNode(params))}`;
}
const SITEMAP_LIMIT = 50000;
function encodePath(p) {
    const withSlash = p.startsWith("/") ? p : `/${p}`;
    // keep already-encoded sequences (%20) intact
    return encodeURI(withSlash).replace(/%25([0-9A-Fa-f]{2})/g, "%$1");
}
function SitemapUrl(origin, entry) {
    const e = typeof entry === "string" ? { path: entry } : entry;
    const tag = (name, value) => XmlElement(name, null, value);
    const children = [
        tag("loc", `${origin}${encodePath(e.path)}`),
    ];
    if (e.lastmod) {
        children.push(tag("lastmod", e.lastmod instanceof Date
            ? e.lastmod.toISOString().split("T")[0]
            : e.lastmod));
    }
    if (e.changefreq)
        children.push(tag("changefreq", e.changefreq));
    if (e.priority !== undefined) {
        const clamped = Math.min(1, Math.max(0, e.priority));
        children.push(tag("priority", clamped.toFixed(1)));
    }
    return XmlElement("url", null, ...children);
}
/**
 * `lastmod` is only emitted when you provide it - stamping every URL with
 * today's date tells search engines nothing useful.
 */
export function GenerateSitemap(origin, entries) {
    if (entries.length > SITEMAP_LIMIT) {
        throw new RangeError(`swift-ssr: a sitemap may contain at most ${SITEMAP_LIMIT} URLs ` +
            `(got ${entries.length}); split it into several files.`);
    }
    const base = origin.replace(/\/+$/, "");
    const urlset = XmlElement("urlset", { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" }, ...entries.map((entry) => SitemapUrl(base, entry)));
    return `<?xml version="1.0" encoding="UTF-8"?>\n${Render(urlset, { xml: true })}`;
}
