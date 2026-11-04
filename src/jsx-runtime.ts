import { Element, Fragment, IsSwiftSSRNode } from "./index.js";
import type {
    HTMLElementTag,
    IntrinsicElementProps,
    SwiftSSRChildren,
    SwiftSSRElement,
} from "./types.js";

/**
 * A component may return anything renderable: an element, a string, an
 * array, null... Non-element results are wrapped in a Fragment.
 */
export type SwiftSSRComponent<P = any> = (props: P) => SwiftSSRChildren;

function toElement(result: SwiftSSRChildren): SwiftSSRElement {
    return IsSwiftSSRNode(result) ? result : Fragment({ children: result });
}

/**
 * Automatic-runtime entry point. By the time this is called, children have
 * already been evaluated (they are nodes, strings, arrays...), so there is
 * nothing to "resolve" - they are handed straight to `Element`.
 */
export function jsx(
    type: HTMLElementTag | SwiftSSRComponent,
    props?: Record<string, any> | null,
    _key?: unknown,
): SwiftSSRElement {
    const p = props ?? {};

    if (typeof type === "function") {
        return toElement(type(p));
    }

    const { children, ...rest } = p;
    return Element(type, rest, children);
}

export const jsxs = jsx;

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
