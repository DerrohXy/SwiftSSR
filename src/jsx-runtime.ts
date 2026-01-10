import { SwiftSSRHTMLElementProps, HTMLElementTag } from "./types";

type SwiftSSRJSXTag = HTMLElementTag | ((props: SwiftSSRHTMLElementProps) => string);

type SwiftSSRJSXChild = SwiftSSRJSXParameters | string;

type SwiftSSRJSXChildren = SwiftSSRJSXChild | Array<SwiftSSRJSXChild>;

type SwiftSSRJSXProps = SwiftSSRHTMLElementProps & {
    children?: SwiftSSRJSXChildren;
};

type SwiftSSRJSXParameters = {
    type: SwiftSSRJSXTag;
    props: SwiftSSRJSXProps;
    key: any;
};

import { Element } from "./index";

/***
 * Recursively parses a child entry
 */
function _parseChild(child: any) {
    if (!child) {
        return null;
    }

    if (child.type) {
        return jsx(child.type, child.props, child.key);
    } else {
        return child;
    }
}

/**
 * Incase the children parameter is not empty
 * @param type
 * @param props
 * @param key
 * @returns
 */
function _withChildren(
    type: HTMLElementTag,
    props: SwiftSSRJSXProps,
    key?: any
): string {
    if (Array.isArray(props.children)) {
        let parsedChildren_ = props.children.map((child) => {
            return _parseChild(child);
        });

        delete props.children;

        return Element(type, props, ...parsedChildren_);
    } else {
        let parsedChild_ = _parseChild(props.children);

        delete props.children;

        return Element(type, props, parsedChild_);
    }
}

/**
 * In case of non empty props
 * @param type
 * @param props
 * @param key
 * @returns
 */
function _withProps(
    type: SwiftSSRJSXTag,
    props: SwiftSSRJSXProps,
    key?: any
): string {
    if (typeof type === "function") {
        return type(props);
    } else {
        return props.children
            ? _withChildren(type, props, key)
            : Element(type, props);
    }
}

/**
 * In case of empty props
 * @param type
 * @param key
 * @returns
 */
function _withoutProps(type: SwiftSSRJSXTag, key?: any): string {
    return typeof type === "string" ? Element(type, {}) : type({});
}

/**
 * Generates a CurlUI render element from a JSX tag
 * @param type Tag to parse
 * @param props Props to parse to the component function
 * @param key #Ignored
 * @returns
 */
export function jsx(
    type: SwiftSSRJSXTag,
    props?: SwiftSSRJSXProps,
    key?: any
): string {
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
            [tag: string]: SwiftSSRHTMLElementProps;
        };

        type ElementClass = (props: SwiftSSRHTMLElementProps) => string;
    }
}
