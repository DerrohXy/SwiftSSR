import { HTMLElementTag, SwiftSSRHTMLElementProps, ClassValue } from "./types";
import fs from "fs";
import path from "path";

function toKebabCase(text: string) {
    return text
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
}

export function EscapeHTML(text: string) {
    return text.replace(
        /[&<>"']/g,
        (token) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[token] || token,
    );
}

function extractEmbeddedLoadPath(value: string): string | null {
    const match = value.match(/^LOAD\("(.+)"\)$/);

    return match ? match[1] : null;
}

function loadEmbeddedFile(filePath: string): string | null {
    try {
        const cwd = process.cwd();

        const packageJsonPath = path.join(cwd, "package.json");

        if (!fs.existsSync(packageJsonPath)) {
            return null;
        }

        const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf8"),
        );

        const scriptsRoot = packageJson.swiftSSRScriptsRoot;

        if (!scriptsRoot || typeof scriptsRoot !== "string") {
            return null;
        }

        const fullPath = path.resolve(cwd, scriptsRoot, filePath);

        if (!fs.existsSync(fullPath)) {
            return null;
        }

        return fs.readFileSync(fullPath, "utf8");
    } catch {
        return null;
    }
}

export function loadEmbeddedFileTemplate(content: string) {
    let loadingPath = extractEmbeddedLoadPath(content);
    if (loadingPath) {
        let loadedContent = loadEmbeddedFile(loadingPath);
        return loadedContent;
    }

    return null;
}

function classNames(...args: ClassValue[]): string {
    const classes: string[] = [];

    args.forEach((arg) => {
        if (!arg) return;

        if (typeof arg === "string" || typeof arg === "number") {
            classes.push(String(arg));
        } else if (Array.isArray(arg)) {
            const inner = classNames(...arg);

            if (inner) classes.push(inner);
        } else if (typeof arg === "object") {
            Object.entries(arg).forEach(([key, value]) => {
                if (value) classes.push(key);
            });
        }
    });

    return classes.join(" ");
}

function formatProps(props: SwiftSSRHTMLElementProps) {
    return (
        Object.entries(props)
            .map(([key, value]) => {
                if (value === null || value === undefined) {
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
            .join(" ")
    );
}

export function Element(
    tag: HTMLElementTag,
    props: SwiftSSRHTMLElementProps | null,
    ...children: Array<string>
): string {
    const propString = props ? ` ${formatProps(props)}`.trimEnd() : "";
    const loadedChildren = children.map((content) => {
        if (["script", "style"].includes(tag)) {
            return loadEmbeddedFileTemplate(content.trim()) ?? content;
        }

        return content;
    });

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

export function EmbeddedJS(
    code: string,
    props?: SwiftSSRHTMLElementProps,
): string {
    let embeddedCode = loadEmbeddedFileTemplate(code.trim()) ?? code;

    return Element("script", props ?? null, embeddedCode.trim());
}

export function EmbeddedCSS(
    code: string,
    props?: SwiftSSRHTMLElementProps,
): string {
    let embeddedCode = loadEmbeddedFileTemplate(code.trim()) ?? code;

    return Element("style", props ?? null, embeddedCode.trim());
}

type DocumentProps = {
    title?: string;
    lang?: string;
    head?: string[];
    body?: string[];
};

export function Document(params: DocumentProps): string {
    const defaultMeta = [
        Element("meta", { charset: "UTF-8" }),
        Element("meta", {
            name: "viewport",
            content: "width=device-width, initial-scale=1.0",
        }),
        Element("title", null, params.title || "Generated Page"),
    ];

    const headContent = (
        params.head ? [...defaultMeta, ...params.head] : defaultMeta
    ).join("\n    ");
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

function SitemapUrl(
    origin: string,
    path: string,
    lastmod?: string,
    priority: number = 0.5,
): string {
    const dateStr = lastmod || new Date().toISOString().split("T")[0];
    const priorityStr = priority.toFixed(1);

    return Element(
        "url",
        null,
        Element("loc", null, `${origin}${path}`),
        Element("lastmod", null, dateStr),
        Element("priority", null, priorityStr),
    );
}

export function GenerateSitemap(origin: string, paths: string[]): string {
    const urlBlocks = paths.map((path) => SitemapUrl(origin, path));

    const urlset = Element(
        "urlset",
        { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" },
        ...urlBlocks,
    );

    return `<?xml version="1.0" encoding="UTF-8"?>\n${urlset}`;
}
