import { Element, Fragment, IsSwiftSSRNode } from "./index.js";
function toElement(result) {
    return IsSwiftSSRNode(result) ? result : Fragment({ children: result });
}
/**
 * Automatic-runtime entry point. By the time this is called, children have
 * already been evaluated (they are nodes, strings, arrays...), so there is
 * nothing to "resolve" - they are handed straight to `Element`.
 */
export function jsx(type, props, _key) {
    const p = props ?? {};
    if (typeof type === "function") {
        return toElement(type(p));
    }
    const { children, ...rest } = p;
    return Element(type, rest, children);
}
export const jsxs = jsx;
export { Fragment };
