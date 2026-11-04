import { Readable } from "node:stream";
import type { ServerResponse } from "node:http";
import type { HTMLElementTag, SwiftSSRHTMLElementProps, ClassValue, SwiftSSRElement, SwiftSSRTextNode, SwiftSSRChildren } from "./types.js";
export type { SwiftSSRElement, SwiftSSRChildren, SwiftSSRHTMLElementProps, } from "./types.js";
export type SwiftSSRConfig = {
    /**
     * Directory that `LOAD("...")` / `LoadJS` / `LoadCSS` may read from.
     * Falls back to `swiftSSRScriptsRoot` in package.json.
     */
    scriptsRoot?: string;
    /** Cache loaded files in memory. Defaults to `NODE_ENV === "production"`. */
    cacheFiles?: boolean;
    /** Treat a lone `LOAD("file")` text child of <script>/<style> as a file include. */
    implicitLoad?: boolean;
    /** URL schemes allowed in href/src/action/... Relative URLs are always allowed. */
    allowedUrlSchemes?: string[];
};
export declare function Configure(options: SwiftSSRConfig): void;
export declare function EscapeHTML(text: unknown): string;
export declare function classNames(...args: ClassValue[]): string;
/** True only for nodes created by this library (not for look-alike JSON). */
export declare function IsSwiftSSRNode(value: unknown): value is SwiftSSRElement;
/**
 * Wrap a string as trusted markup that `Render` inserts verbatim. Never wrap
 * raw user input in `RawHTML`.
 */
export declare function RawHTML(value: string): SwiftSSRTextNode;
/**
 * Reads a file sandboxed to the scripts root. Rejects absolute paths, NUL
 * bytes, `..` escapes and symlinks pointing outside the root. Returns null on
 * any failure.
 */
export declare function LoadEmbeddedFile(embeddedPath: string): string | null;
export declare function loadEmbeddedFileTemplate(content: string): string | null;
/** True if `value` is a relative URL or uses an allowed scheme. */
export declare function IsSafeURL(value: string): boolean;
/**
 * Builds an element node. Does NOT return a string - call `Render()`.
 * String/number children are escaped; wrap trusted markup in `RawHTML(...)`.
 * Throws on objects that aren't nodes (e.g. a forgotten `await`).
 */
export declare function Element(tag: HTMLElementTag, props: SwiftSSRHTMLElementProps | null, ...children: SwiftSSRChildren[]): SwiftSSRElement;
/** Like `Element` but for XML vocabularies (sitemaps, RSS, ...).
 * Use with `Render(node, { xml: true })`.
 * */
export declare function XmlElement(tag: string, props: SwiftSSRHTMLElementProps | null, ...children: SwiftSSRChildren[]): SwiftSSRElement;
/** Children with no wrapper element (what `<>...</>` compiles to). */
export declare function Fragment(props?: {
    children?: SwiftSSRChildren;
}): SwiftSSRElement;
export type RenderOptions = {
    /** Serialize as XML: empty elements become `<x/>`, no HTML void/boolean rules. */
    xml?: boolean;
};
/** Serializes a node (or list of nodes) into a string. */
export declare function Render(node: SwiftSSRElement | SwiftSSRElement[] | null | undefined, options?: RenderOptions): string;
/**
 * Streaming render. Returns a Readable, so backpressure is handled by Node:
 * `RenderToReadable(node).pipe(res)`.
 */
export declare function RenderToReadable(node: SwiftSSRElement | SwiftSSRElement[], options?: RenderOptions & {
    doctype?: boolean;
}): Readable;
/** Express/http helper: send a finished HTML string. */
export declare function SendHTML(res: ServerResponse, html: string, status?: number): void;
/** Express/http helper: stream a node tree (e.g. from `DocumentNode`) to the response. */
export declare function StreamHTML(res: ServerResponse, node: SwiftSSRElement, options?: {
    status?: number;
    doctype?: boolean;
}): void;
export declare function EmbeddedJS(code: string, props?: SwiftSSRHTMLElementProps): SwiftSSRElement;
export declare function EmbeddedCSS(code: string, props?: SwiftSSRHTMLElementProps): SwiftSSRElement;
/** Explicit alternative to `LOAD("...")`: inline a file from the scripts root. */
export declare function LoadJS(file: string, props?: SwiftSSRHTMLElementProps): SwiftSSRElement;
export declare function LoadCSS(file: string, props?: SwiftSSRHTMLElementProps): SwiftSSRElement;
/**
 * Embed data for client code: `<script type="application/json" id="...">`.
 * `<`, `>`, `&` and U+2028/9 are escaped so the payload can't break out.
 */
export declare function JsonScript(data: unknown, props?: SwiftSSRHTMLElementProps): SwiftSSRElement;
export type DocumentProps = {
    title?: string;
    lang?: string;
    /** Extra <head> content. A <title>, charset or viewport meta here replaces the default. */
    head?: SwiftSSRChildren;
    body?: SwiftSSRChildren;
    htmlProps?: SwiftSSRHTMLElementProps;
    bodyProps?: SwiftSSRHTMLElementProps;
};
/** Builds the full <html> tree. Pair with `StreamHTML` to stream it. */
export declare function DocumentNode(params: DocumentProps): SwiftSSRElement;
export declare function Document(params: DocumentProps): string;
export type SitemapEntry = string | {
    path: string;
    lastmod?: string | Date;
    priority?: number;
    changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
};
/**
 * `lastmod` is only emitted when you provide it - stamping every URL with
 * today's date tells search engines nothing useful.
 */
export declare function GenerateSitemap(origin: string, entries: SitemapEntry[]): string;
