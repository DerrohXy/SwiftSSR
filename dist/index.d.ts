import { HTMLElementTag, SwiftSSRHTMLElementProps } from "./types";
export declare function EscapeHTML(text: string): string;
export declare function loadEmbeddedFileTemplate(content: string): string | null;
export declare function Element(tag: HTMLElementTag, props: SwiftSSRHTMLElementProps | null, ...children: Array<string>): string;
export declare function EmbeddedJS(code: string, props?: SwiftSSRHTMLElementProps): string;
export declare function EmbeddedCSS(code: string, props?: SwiftSSRHTMLElementProps): string;
type DocumentProps = {
    title?: string;
    lang?: string;
    head?: string[];
    body?: string[];
};
export declare function Document(params: DocumentProps): string;
export declare function GenerateSitemap(origin: string, paths: string[]): string;
export {};
