"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsxs = void 0;
exports.jsx = jsx;
const index_1 = require("./index");
/***
 * Recursively parses a child entry
 */
function _parseChild(child) {
    if (!child) {
        return null;
    }
    if (child.type) {
        return jsx(child.type, child.props, child.key);
    }
    else {
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
function _withChildren(type, props, key) {
    if (Array.isArray(props.children)) {
        let parsedChildren_ = props.children.map((child) => {
            return _parseChild(child);
        });
        delete props.children;
        return (0, index_1.Element)(type, props, ...parsedChildren_);
    }
    else {
        let parsedChild_ = _parseChild(props.children);
        delete props.children;
        return (0, index_1.Element)(type, props, parsedChild_);
    }
}
/**
 * In case of non empty props
 * @param type
 * @param props
 * @param key
 * @returns
 */
function _withProps(type, props, key) {
    if (typeof type === "function") {
        return type(props);
    }
    else {
        return props.children
            ? _withChildren(type, props, key)
            : (0, index_1.Element)(type, props);
    }
}
/**
 * In case of empty props
 * @param type
 * @param key
 * @returns
 */
function _withoutProps(type, key) {
    return typeof type === "string" ? (0, index_1.Element)(type, {}) : type({});
}
/**
 * Generates a render element from a JSX tag
 * @param type Tag to parse
 * @param props Props to parse to the component function
 * @param key #Ignored
 * @returns
 */
function jsx(type, props, key) {
    if (props) {
        return _withProps(type, props, key);
    }
    else {
        return _withoutProps(type, key);
    }
}
exports.jsxs = jsx;
