import { Fragment } from "./index.js";
import type { HTMLElementTag, IntrinsicElementProps, SwiftSSRChildren, SwiftSSRElement } from "./types.js";
/**
 * A component may return anything renderable: an element, a string, an
 * array, null... Non-element results are wrapped in a Fragment.
 */
export type SwiftSSRComponent<P = any> = (props: P) => SwiftSSRChildren;
/**
 * Automatic-runtime entry point. By the time this is called, children have
 * already been evaluated (they are nodes, strings, arrays...), so there is
 * nothing to "resolve" - they are handed straight to `Element`.
 */
export declare function jsx(type: HTMLElementTag | SwiftSSRComponent, props?: Record<string, any> | null, _key?: unknown): SwiftSSRElement;
export declare const jsxs: typeof jsx;
export { Fragment };
export declare namespace JSX {
    type Element = SwiftSSRElement;
    type ElementType = HTMLElementTag | SwiftSSRComponent;
    interface ElementChildrenAttribute {
        children: {};
    }
    interface IntrinsicAttributes {
        key?: string | number;
    }
    type IntrinsicElements = IntrinsicElementProps;
}
