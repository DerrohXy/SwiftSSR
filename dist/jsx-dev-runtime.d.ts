import type { HTMLElementTag } from "./types.js";
import type { SwiftSSRComponent } from "./jsx-runtime.js";
export { Fragment } from "./jsx-runtime.js";
export type { JSX } from "./jsx-runtime.js";
/** Used by TypeScript when `"jsx": "react-jsxdev"`; extra args are ignored. */
export declare function jsxDEV(type: HTMLElementTag | SwiftSSRComponent, props?: Record<string, any> | null, key?: unknown, _isStaticChildren?: boolean, _source?: unknown, _self?: unknown): import("./types.js").SwiftSSRElement;
