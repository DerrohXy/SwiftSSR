import { HTMLElementTag, SwiftSSRHTMLElementProps, SwiftSSRElement, SwiftSSRTextNode, SwiftSSRChildren } from "./types";
export declare function ValidHTML(htmlString: string): boolean;
export declare function EscapeHTML(text: string): string;
/**
 * Wrap a string as trusted, pre-escaped/raw markup so `Render` inserts it
 * verbatim instead of HTML-escaping it. Only use this for content you
 * generated or fully trust — never wrap raw user input in `RawHTML`.
 */
export declare function RawHTML(value: string): SwiftSSRTextNode;
/**
 * Reads a file from disk, sandboxed to the `swiftSSRScriptsRoot` (or
 * `SwiftSSRScriptsRoot`) directory declared in the project's package.json.
 *
 * `embeddedPath` is never trusted as-is: absolute paths are rejected
 * outright, and the resolved path is verified to still live inside the
 * configured scripts root before it's read, so a value like
 * `../../../../etc/passwd` cannot escape the sandbox.
 */
export declare function LoadEmbeddedFile(embeddedPath: string): string | null;
export declare function loadEmbeddedFileTemplate(content: string): string | null;
/**
 * Builds a `SwiftSSRElement` node describing this tag, its attributes, and
 * its children. This does NOT return an HTML string — call `Render()` on
 * the result (directly, or via `Document`/`GenerateSitemap`) to serialize
 * it. Plain string/number children become escaped text nodes by default;
 * wrap trusted markup in `RawHTML(...)` if you need to bypass escaping.
 */
export declare function Element(tag: HTMLElementTag, props: SwiftSSRHTMLElementProps | null, ...children: SwiftSSRChildren[]): SwiftSSRElement;
/**
 * Serializes a `SwiftSSRElement` (or a list of them) into an HTML string.
 * Text nodes are HTML-escaped unless they were created with `RawHTML(...)`.
 */
export declare function Render(node: SwiftSSRElement | SwiftSSRElement[] | null | undefined): string;
export declare function EmbeddedJS(code: string, props?: SwiftSSRHTMLElementProps): SwiftSSRElement;
export declare function EmbeddedCSS(code: string, props?: SwiftSSRHTMLElementProps): SwiftSSRElement;
type DocumentProps = {
    title?: string;
    lang?: string;
    head?: SwiftSSRElement[];
    body?: SwiftSSRElement[];
};
export declare function Document(params: DocumentProps): string;
export declare function GenerateSitemap(origin: string, paths: string[]): string;
export {};
