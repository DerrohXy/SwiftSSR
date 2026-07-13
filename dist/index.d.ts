import { HTMLElementTag, SwiftSSRHTMLElementProps, SwiftSSRElement } from "./types";
export declare function EscapeHTML(text: string): string;
export declare function LoadEmbeddedFile(embeddedPath: string): string | null;
export declare function loadEmbeddedFileTemplate(content: string): string | null;
export declare function Element(tag: HTMLElementTag, props: SwiftSSRHTMLElementProps | null, ...children: Array<SwiftSSRElement | null>): SwiftSSRElement;
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
