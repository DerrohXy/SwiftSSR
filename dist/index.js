import fs from "fs";
import path from "path";
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
// Tags whose content is code, not visible text. Their children are treated
// as trusted/raw (never HTML-escaped) and are additionally guarded against
// accidentally closing their own tag early (see Render()).
const CODE_TAGS = new Set(["script", "style"]);
function toKebabCase(text) {
    return text
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
}
function spread(items) {
    if (!Array.isArray(items)) {
        return [items];
    }
    const spread_ = [];
    items.forEach((x) => {
        if (Array.isArray(x)) {
            spread_.push(...spread(x));
        }
        else {
            spread_.push(x);
        }
    });
    return spread_;
}
export function ValidHTML(htmlString) {
    // NOTE: this relies on a global `DOMParser`, which is a browser API and
    // is NOT available in plain Node.js. To use this function server-side,
    // provide a DOMParser implementation yourself (e.g. via the `jsdom` or
    // `linkedom` packages) before calling it, or treat it as unsupported.
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "application/xml");
    const errorNode = doc.querySelector("parsererror");
    return !errorNode;
}
export function EscapeHTML(text) {
    return text.replace(/[&<>"']/g, (token) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[token] || token);
}
function TextNode(value, raw = false) {
    return { kind: "text", value, raw };
}
/**
 * Wrap a string as trusted, pre-escaped/raw markup so `Render` inserts it
 * verbatim instead of HTML-escaping it. Only use this for content you
 * generated or fully trust — never wrap raw user input in `RawHTML`.
 */
export function RawHTML(value) {
    return TextNode(value, true);
}
function isSwiftSSRElement(value) {
    return (typeof value === "object" &&
        value !== null &&
        "kind" in value &&
        (value.kind === "text" || value.kind === "element"));
}
function normalizeChild(child) {
    if (child === null ||
        child === undefined ||
        child === false ||
        child === true) {
        return null;
    }
    if (typeof child === "string" || typeof child === "number") {
        // Plain text children are escaped by default when rendered.
        return TextNode(String(child));
    }
    if (isSwiftSSRElement(child)) {
        return child;
    }
    return null;
}
function extractEmbeddedLoadPath(value) {
    const match = value.match(/^LOAD\("(.+)"\)$/);
    return match ? match[1] : null;
}
/**
 * Reads a file from disk, sandboxed to the `swiftSSRScriptsRoot` (or
 * `SwiftSSRScriptsRoot`) directory declared in the project's package.json.
 *
 * `embeddedPath` is never trusted as-is: absolute paths are rejected
 * outright, and the resolved path is verified to still live inside the
 * configured scripts root before it's read, so a value like
 * `../../../../etc/passwd` cannot escape the sandbox.
 */
export function LoadEmbeddedFile(embeddedPath) {
    try {
        if (typeof embeddedPath !== "string" ||
            embeddedPath.length === 0 ||
            embeddedPath.includes("\0") ||
            path.isAbsolute(embeddedPath)) {
            return null;
        }
        const cwd = process.cwd();
        const packageJsonPath = path.join(cwd, "package.json");
        if (!fs.existsSync(packageJsonPath)) {
            return null;
        }
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        const scriptsRoot = packageJson.swiftSSRScriptsRoot || packageJson.SwiftSSRScriptsRoot;
        if (!scriptsRoot || typeof scriptsRoot !== "string") {
            return null;
        }
        const scriptsRootResolved = path.resolve(cwd, scriptsRoot);
        const fullPath = path.resolve(scriptsRootResolved, embeddedPath);
        // Sandbox check: fullPath must remain inside scriptsRootResolved.
        const relativeToRoot = path.relative(scriptsRootResolved, fullPath);
        const escapesRoot = relativeToRoot.startsWith(`..${path.sep}`) ||
            relativeToRoot === ".." ||
            path.isAbsolute(relativeToRoot);
        if (escapesRoot) {
            return null;
        }
        if (!fs.existsSync(fullPath)) {
            return null;
        }
        return fs.readFileSync(fullPath, "utf8");
    }
    catch {
        return null;
    }
}
export function loadEmbeddedFileTemplate(content) {
    const loadingPath = extractEmbeddedLoadPath(content);
    if (loadingPath) {
        return LoadEmbeddedFile(loadingPath);
    }
    return null;
}
function classNames(...args) {
    const classes = [];
    args.forEach((arg) => {
        if (!arg)
            return;
        if (typeof arg === "string" || typeof arg === "number") {
            classes.push(String(arg));
        }
        else if (Array.isArray(arg)) {
            const inner = classNames(...arg);
            if (inner)
                classes.push(inner);
        }
        else if (typeof arg === "object") {
            Object.entries(arg).forEach(([key, value]) => {
                if (value)
                    classes.push(key);
            });
        }
    });
    return classes.join(" ");
}
function formatProps(props) {
    return Object.entries(props)
        .map(([key, value]) => {
        if (key === "children") {
            return "";
        }
        if (value === null ||
            value === undefined ||
            (typeof value === "object" &&
                key !== "className" &&
                key !== "style")) {
            return "";
        }
        if (key === "className") {
            const resolvedClasses = classNames(value);
            return resolvedClasses
                ? `class="${EscapeHTML(resolvedClasses)}"`
                : "";
        }
        if (key === "style" && typeof value === "object") {
            const styleString = Object.entries(value)
                .map(([sKey, sVal]) => `${toKebabCase(sKey)}:${sVal}`)
                .join("; ");
            return styleString ? `style="${EscapeHTML(styleString)}"` : "";
        }
        if (value === true) {
            return key;
        }
        if (value === false) {
            return "";
        }
        return `${key}="${EscapeHTML(String(value))}"`;
    })
        .filter(Boolean)
        .join(" ");
}
/**
 * Builds a `SwiftSSRElement` node describing this tag, its attributes, and
 * its children. This does NOT return an HTML string — call `Render()` on
 * the result (directly, or via `Document`/`GenerateSitemap`) to serialize
 * it. Plain string/number children become escaped text nodes by default;
 * wrap trusted markup in `RawHTML(...)` if you need to bypass escaping.
 */
export function Element(tag, props, ...children) {
    const flatChildren = spread(children)
        .map(normalizeChild)
        .filter((c) => c !== null);
    let restProps = props;
    if (props && props.children !== undefined) {
        const propChildren = spread(props.children)
            .map(normalizeChild)
            .filter((c) => c !== null);
        flatChildren.push(...propChildren);
        const { children: _omit, ...rest } = props;
        restProps = rest;
    }
    const isCodeTag = CODE_TAGS.has(tag.toLowerCase());
    const finalChildren = isCodeTag
        ? flatChildren.map((child) => {
            if (child.kind === "text" && !child.raw) {
                const loaded = loadEmbeddedFileTemplate(child.value.trim());
                return RawHTML(loaded ?? child.value);
            }
            return child;
        })
        : flatChildren;
    const node = {
        kind: "element",
        tag,
        props: restProps ?? null,
        children: finalChildren,
    };
    return node;
}
/**
 * Serializes a `SwiftSSRElement` (or a list of them) into an HTML string.
 * Text nodes are HTML-escaped unless they were created with `RawHTML(...)`.
 */
export function Render(node) {
    if (Array.isArray(node)) {
        return node.map((n) => Render(n)).join("");
    }
    if (!node) {
        return "";
    }
    if (node.kind === "text") {
        return node.raw ? node.value : EscapeHTML(node.value);
    }
    const { tag, props, children } = node;
    const propString = props ? ` ${formatProps(props)}`.trimEnd() : "";
    const tagLower = tag.toLowerCase();
    if (VOID_ELEMENTS.has(tagLower)) {
        return `<${tag}${propString}>`;
    }
    let content = children.map((child) => Render(child)).join("");
    if (CODE_TAGS.has(tagLower)) {
        // Belt-and-braces: even trusted script/style content shouldn't be
        // able to prematurely close its own tag.
        content = content.replace(/<\/(script|style)/gi, "<\\/$1");
    }
    return `<${tag}${propString}>${content}</${tag}>`;
}
export function EmbeddedJS(code, props) {
    return Element("script", props ?? null, code);
}
export function EmbeddedCSS(code, props) {
    return Element("style", props ?? null, code);
}
export function Document(params) {
    const defaultMeta = [
        Element("meta", { charset: "UTF-8" }),
        Element("meta", {
            name: "viewport",
            content: "width=device-width, initial-scale=1.0",
        }),
        Element("title", null, params.title || "Generated Page"),
    ];
    const headNodes = params.head
        ? [...defaultMeta, ...params.head]
        : defaultMeta;
    const bodyNodes = params.body ?? [];
    const htmlNode = Element("html", { lang: params.lang || "en" }, Element("head", null, ...headNodes), Element("body", null, ...bodyNodes));
    return `<!DOCTYPE html>\n${Render(htmlNode)}`;
}
function SitemapUrl(origin, urlPath, lastmod, priority = 0.5) {
    const dateStr = lastmod || new Date().toISOString().split("T")[0];
    const priorityStr = priority.toFixed(1);
    // Text children are escaped by default, so `&`/`<`/etc. in origin or
    // urlPath can no longer produce invalid XML here.
    return Element("url", null, Element("loc", null, `${origin}${urlPath}`), Element("lastmod", null, dateStr), Element("priority", null, priorityStr));
}
export function GenerateSitemap(origin, paths) {
    const urlBlocks = paths.map((p) => SitemapUrl(origin, p));
    const urlset = Element("urlset", { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" }, ...urlBlocks);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${Render(urlset)}`;
}
