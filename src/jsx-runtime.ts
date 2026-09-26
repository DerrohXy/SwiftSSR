import {
    SwiftSSRHTMLElementProps,
    HTMLElementTag,
    SwiftSSRElement,
    SwiftSSRChildren,
} from "./types";

type SwiftSSRJSXTag =
    | HTMLElementTag
    | ((props: SwiftSSRHTMLElementProps) => SwiftSSRElement);

type SwiftSSRJSXChild =
    | SwiftSSRJSXParameters
    | SwiftSSRElement
    | string
    | number
    | null
    | undefined
    | boolean;

// Recursive so that arbitrarily nested arrays of children (e.g. from
// `.map()` calls in JSX) type-check.
type SwiftSSRJSXChildren = SwiftSSRJSXChild | SwiftSSRJSXChildren[];

type SwiftSSRJSXProps = SwiftSSRHTMLElementProps & {
    children?: SwiftSSRJSXChildren;
};

type SwiftSSRJSXParameters = {
    type: SwiftSSRJSXTag;
    props: SwiftSSRJSXProps;
    key: any;
};

import { Element } from "./index.js";

function isJSXParameters(value: unknown): value is SwiftSSRJSXParameters {
    return (
        typeof value === "object" &&
        value !== null &&
        "type" in (value as any) &&
        "props" in (value as any)
    );
}

/**
 * Recursively resolves JSX children down to something `Element` accepts:
 * strings/numbers, already-built `SwiftSSRElement`s, nested arrays, or
 * null/undefined/boolean (skipped). Unresolved `{ type, props, key }`
 * JSX parameter objects are turned into real elements via `jsx()`.
 */
function _parseChild(child: SwiftSSRJSXChildren): SwiftSSRChildren {
    if (child === null || child === undefined || typeof child === "boolean") {
        return null;
    }

    if (Array.isArray(child)) {
        return child.map((c) => _parseChild(c));
    }

    if (isJSXParameters(child)) {
        return jsx(child.type, child.props, child.key);
    }

    return child;
}

/**
 * Incase the children parameter is not empty
 */
function _withChildren(
    type: HTMLElementTag,
    props: SwiftSSRJSXProps,
    key?: any,
): SwiftSSRElement {
    const parsedChildren = _parseChild(props.children);

    const { children: _omit, ...rest } = props;

    return Element(type, rest as SwiftSSRHTMLElementProps, parsedChildren);
}

/**
 * In case of non empty props
 */
function _withProps(
    type: SwiftSSRJSXTag,
    props: SwiftSSRJSXProps,
    key?: any,
): SwiftSSRElement {
    if (typeof type === "function") {
        return type(props);
    } else {
        return props.children !== undefined
            ? _withChildren(type, props, key)
            : Element(type, props);
    }
}

/**
 * In case of empty props
 */
function _withoutProps(type: SwiftSSRJSXTag, key?: any): SwiftSSRElement {
    return typeof type === "string" ? Element(type, {}) : type({});
}

/**
 * Generates a render element (a `SwiftSSRElement` node, not a string) from
 * a JSX tag. Call `Render()` on the result to get HTML.
 */
export function jsx(
    type: SwiftSSRJSXTag,
    props?: SwiftSSRJSXProps,
    key?: any,
): SwiftSSRElement {
    if (props) {
        return _withProps(type, props, key);
    } else {
        return _withoutProps(type, key);
    }
}

export const jsxs = jsx;

declare global {
    namespace JSX {
        type IntrinsicElements = {
            [tag in HTMLElementTag]: SwiftSSRHTMLElementProps;
        };

        type ElementClass = (
            props: SwiftSSRHTMLElementProps,
        ) => SwiftSSRElement;
    }
}
