"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidHTML = ValidHTML;
exports.EscapeHTML = EscapeHTML;
exports.LoadEmbeddedFile = LoadEmbeddedFile;
exports.loadEmbeddedFileTemplate = loadEmbeddedFileTemplate;
exports.Element = Element;
exports.EmbeddedJS = EmbeddedJS;
exports.EmbeddedCSS = EmbeddedCSS;
exports.Document = Document;
exports.GenerateSitemap = GenerateSitemap;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
    items.map((x) => {
        if (Array.isArray(x)) {
            spread_.push(...spread(x));
        }
        else {
            spread_.push(x);
        }
    });
    return spread_;
}
function ValidHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "application/xml");
    const errorNode = doc.querySelector("parsererror");
    return !errorNode;
}
function EscapeHTML(text) {
    return text.replace(/[&<>"']/g, (token) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[token] || token);
}
function extractEmbeddedLoadPath(value) {
    const match = value.match(/^LOAD\("(.+)"\)$/);
    return match ? match[1] : null;
}
function LoadEmbeddedFile(embeddedPath) {
    try {
        const cwd = process.cwd();
        const packageJsonPath = path_1.default.join(cwd, "package.json");
        if (!fs_1.default.existsSync(packageJsonPath)) {
            return null;
        }
        const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, "utf8"));
        const scriptsRoot = packageJson.swiftSSRScriptsRoot || packageJson.SwiftSSRScriptsRoot;
        if (!scriptsRoot || typeof scriptsRoot !== "string") {
            return null;
        }
        const fullPath = path_1.default.resolve(cwd, scriptsRoot, embeddedPath);
        if (!fs_1.default.existsSync(fullPath)) {
            return null;
        }
        return fs_1.default.readFileSync(fullPath, "utf8");
    }
    catch {
        return null;
    }
}
function loadEmbeddedFileTemplate(content) {
    let loadingPath = extractEmbeddedLoadPath(content);
    if (loadingPath) {
        let loadedContent = LoadEmbeddedFile(loadingPath);
        return loadedContent;
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
    return (Object.entries(props)
        .map(([key, value]) => {
        if (value === null ||
            value === undefined ||
            typeof value === "object") {
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
            return `style="${styleString}"`;
        }
        if (value === true) {
            return key;
        }
        if (value === false) {
            return "";
        }
        return `${key}="${EscapeHTML(String(value))}"`;
    })
        //.filter(Boolean)
        .join(" "));
}
function Element(tag, props, ...children) {
    const loadedChildren = spread(children).map((content) => {
        if (!content) {
            return "";
        }
        if (["script", "style"].includes(tag)) {
            return loadEmbeddedFileTemplate(content.trim()) ?? content;
        }
        return content;
    });
    if (props && props.children) {
        loadedChildren.push(...spread(props.children).map((content) => {
            if (!content) {
                return "";
            }
            if (["script", "style"].includes(tag)) {
                return loadEmbeddedFileTemplate(content.trim()) ?? content;
            }
            return content;
        }));
        props.children = undefined;
    }
    const propString = props ? ` ${formatProps(props)}`.trimEnd() : "";
    const content = loadedChildren.join("");
    const voidElements = [
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
    ];
    if (voidElements.includes(tag.toLowerCase())) {
        return `<${tag}${propString}>`;
    }
    return `<${tag}${propString}>${content}</${tag}>`;
}
function EmbeddedJS(code, props) {
    let embeddedCode = loadEmbeddedFileTemplate(code.trim()) ?? code;
    return Element("script", props ?? null, embeddedCode.trim());
}
function EmbeddedCSS(code, props) {
    let embeddedCode = loadEmbeddedFileTemplate(code.trim()) ?? code;
    return Element("style", props ?? null, embeddedCode.trim());
}
function Document(params) {
    const defaultMeta = [
        Element("meta", { charset: "UTF-8" }),
        Element("meta", {
            name: "viewport",
            content: "width=device-width, initial-scale=1.0",
        }),
        Element("title", null, params.title || "Generated Page"),
    ];
    const headContent = (params.head ? [...defaultMeta, ...params.head] : defaultMeta).join("\n    ");
    const bodyContent = params.body ? params.body.join("\n    ") : "";
    return [
        `<!DOCTYPE html>`,
        `<html lang="${params.lang || "en"}">`,
        `<head>`,
        `    ${headContent}`,
        `</head>`,
        `<body>`,
        `    ${bodyContent}`,
        `</body>`,
        `</html>`,
    ].join("\n");
}
function SitemapUrl(origin, path, lastmod, priority = 0.5) {
    const dateStr = lastmod || new Date().toISOString().split("T")[0];
    const priorityStr = priority.toFixed(1);
    return Element("url", null, Element("loc", null, `${origin}${path}`), Element("lastmod", null, dateStr), Element("priority", null, priorityStr));
}
function GenerateSitemap(origin, paths) {
    const urlBlocks = paths.map((path) => SitemapUrl(origin, path));
    const urlset = Element("urlset", { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" }, ...urlBlocks);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${urlset}`;
}
