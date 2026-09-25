import { Element } from "./index";
function isJSXParameters(value) {
    return (typeof value === "object" &&
        value !== null &&
        "type" in value &&
        "props" in value);
}
/**
 * Recursively resolves JSX children down to something `Element` accepts:
 * strings/numbers, already-built `SwiftSSRElement`s, nested arrays, or
 * null/undefined/boolean (skipped). Unresolved `{ type, props, key }`
 * JSX parameter objects are turned into real elements via `jsx()`.
 */
function _parseChild(child) {
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
function _withChildren(type, props, key) {
    const parsedChildren = _parseChild(props.children);
    const { children: _omit, ...rest } = props;
    return Element(type, rest, parsedChildren);
}
/**
 * In case of non empty props
 */
function _withProps(type, props, key) {
    if (typeof type === "function") {
        return type(props);
    }
    else {
        return props.children !== undefined
            ? _withChildren(type, props, key)
            : Element(type, props);
    }
}
/**
 * In case of empty props
 */
function _withoutProps(type, key) {
    return typeof type === "string" ? Element(type, {}) : type({});
}
/**
 * Generates a render element (a `SwiftSSRElement` node, not a string) from
 * a JSX tag. Call `Render()` on the result to get HTML.
 */
export function jsx(type, props, key) {
    if (props) {
        return _withProps(type, props, key);
    }
    else {
        return _withoutProps(type, key);
    }
}
export const jsxs = jsx;
