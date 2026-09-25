import { SwiftSSRHTMLElementProps, HTMLElementTag, SwiftSSRElement } from "./types";
type SwiftSSRJSXTag = HTMLElementTag | ((props: SwiftSSRHTMLElementProps) => SwiftSSRElement);
type SwiftSSRJSXChild = SwiftSSRJSXParameters | SwiftSSRElement | string | number | null | undefined | boolean;
type SwiftSSRJSXChildren = SwiftSSRJSXChild | SwiftSSRJSXChildren[];
type SwiftSSRJSXProps = SwiftSSRHTMLElementProps & {
    children?: SwiftSSRJSXChildren;
};
type SwiftSSRJSXParameters = {
    type: SwiftSSRJSXTag;
    props: SwiftSSRJSXProps;
    key: any;
};
/**
 * Generates a render element (a `SwiftSSRElement` node, not a string) from
 * a JSX tag. Call `Render()` on the result to get HTML.
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
