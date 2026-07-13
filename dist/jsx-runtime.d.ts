import { SwiftSSRHTMLElementProps, HTMLElementTag, SwiftSSRElement } from "./types";
type SwiftSSRJSXTag = HTMLElementTag | ((props: SwiftSSRHTMLElementProps) => SwiftSSRElement);
type SwiftSSRJSXChild = SwiftSSRJSXParameters | SwiftSSRElement;
type SwiftSSRJSXChildren = SwiftSSRJSXChild | Array<SwiftSSRJSXChild>;
type SwiftSSRJSXProps = SwiftSSRHTMLElementProps & {
    children?: SwiftSSRJSXChildren;
};
type SwiftSSRJSXParameters = {
    type: SwiftSSRJSXTag;
    props: SwiftSSRJSXProps;
    key: any;
};
/**
 * Generates a render element from a JSX tag
 * @param type Tag to parse
 * @param props Props to parse to the component function
 * @param key #Ignored
 * @returns
 */
export declare function jsx(type: SwiftSSRJSXTag, props?: SwiftSSRJSXProps, key?: any): SwiftSSRElement;
export declare const jsxs: typeof jsx;
declare global {
    namespace JSX {
        type IntrinsicElements = {
            [tag in HTMLElementTag]: SwiftSSRHTMLElementProps;
        };
        type ElementClass = (props: SwiftSSRHTMLElementProps) => SwiftSSRElement;
    }
}
export {};
