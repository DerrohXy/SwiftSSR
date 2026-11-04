import { jsx } from "./jsx-runtime.js";
export { Fragment } from "./jsx-runtime.js";
/** Used by TypeScript when `"jsx": "react-jsxdev"`; extra args are ignored. */
export function jsxDEV(type, props, key, _isStaticChildren, _source, _self) {
    return jsx(type, props, key);
}
