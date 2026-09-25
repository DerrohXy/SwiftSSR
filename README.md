# SwiftSSR

A minimal, dependency-light HTML rendering toolkit for server-side use in Node.js. It gives you a tag-builder function (`Element`) that builds a small node tree, a `Render` function that turns that tree into an HTML string, an optional JSX runtime so you can write `.tsx` templates, a `Document` helper for full HTML pages, and a small `GenerateSitemap` utility — all with no client-side runtime or virtual DOM involved.

## Why

- **A real node tree, not opaque strings.** `Element(...)` builds a `SwiftSSRNode` — either a text node or an element node with typed children — instead of concatenating strings as it goes. `Render(...)` is the one place that turns that tree into HTML.
- **Escaped by default.** Text children are HTML-escaped automatically at render time. You only get unescaped output where you explicitly ask for it (script/style bodies, or `RawHTML(...)`).
- **No client runtime.** Nothing here ships to the browser; it only builds markup on the server.
- **Optional JSX.** Use the `jsx-runtime` if you'd rather write templates as `.tsx` than as nested `Element(...)` calls — both build the same node tree.
- **Typed props.** `CSSProps` and `HTMLBaseElementProps` give you autocomplete and basic type-checking for standard HTML attributes and inline styles.

## Installation

```bash
npm install swiftssr
```

## Quick start

### Function-call style

```ts
import { Element, Document } from "swift-ssr";

// Document() already calls Render() internally and returns a plain string.
const page = Document({
  title: "Hello",
  body: [
    Element("div", { className: "container" },
      Element("h1", null, "Welcome"),
      Element("p", { style: { color: "#333" } }, "Rendered on the server.")
    ),
  ],
});

res.setHeader("Content-Type", "text/html");
res.send(page);
```

`Element(...)` itself returns a `SwiftSSRNode`, not a string — see [Element and Render](#element-tag-props-children) below for rendering a tree standalone.

### JSX style

Enable the JSX runtime in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "swift-ssr"
  }
}
```

Then write templates as `.tsx`:

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

function Page() {
  return (
    <div className="container">
      <Greeting name="world" />
      <p style={{ color: "#333" }}>Rendered on the server.</p>
    </div>
  );
}
```

Function components are called eagerly and return a `SwiftSSRNode`, same as `Element(...)` — there's no reconciliation, diffing, or state.

## API reference

### `Element(tag, props, ...children)`

Builds a single element as a `SwiftSSRNode` (an object, not a string — see `Render` below for turning it into HTML).

```ts
import { Element, Render } from "swift-ssr";

const node = Element("a", { href: "/about", className: "link" }, "About us");
Render(node);
// => <a href="/about" class="link">About us</a>
```

- `tag` — one of the built-in `HTMLElementTag` values (standard HTML tags, common SVG tags, plus the sitemap-specific tags used by `GenerateSitemap`).
- `props` — attributes, `style` (a `CSSProps` object, converted to a kebab-case inline style string), `className` (accepts strings, numbers, arrays, and `{ class: boolean }` maps, same idea as the `classnames` package), and any event-handler string props (`onclick`, etc.).
- `children` — strings, numbers, `SwiftSSRNode`s, arrays of any of those (including nested arrays, which are flattened), or `null`/`undefined`/`false` (skipped).
- Void elements (`br`, `img`, `input`, `hr`, etc.) are rendered self-closing with no closing tag, per the HTML spec.

**Text children are HTML-escaped by default.** Any string or number you pass as a child becomes a text node that `Render` escapes automatically — so `Element("p", null, userComment)` is safe to use directly with untrusted input, no manual `EscapeHTML` call needed.

### `Render(node)`

Serializes a `SwiftSSRNode` (or an array of them) into an HTML string. This is the only place text actually gets escaped or left raw, based on how the node was built — every other helper in this library (`Document`, `GenerateSitemap`) calls it internally.

```ts
Render(Element("div", null, "hi"));                 // => <div>hi</div>
Render([Element("p", null, "a"), Element("p", null, "b")]); // concatenates multiple nodes
Render(null);                                        // => ""
```

### `RawHTML(value)`

An explicit escape hatch for inserting markup you've already built and trust (e.g. the output of a markdown renderer you control) without it being HTML-escaped.

```ts
Element("div", null, RawHTML("<b>already-safe markup</b>"));
```

**⚠️ Never pass untrusted or user-supplied content through `RawHTML`.** Doing so reintroduces the exact XSS risk that escape-by-default children are meant to prevent.

### `EscapeHTML(text)`

Escapes `&`, `<`, `>`, `"`, and `'`. `Render` and `formatProps` use this internally for text nodes and attribute values; you generally won't need to call it directly unless you're building a `RawHTML` string by hand from mixed trusted/untrusted parts.

### `Document({ title, lang, head, body })`

Wraps a list of head/body elements in a full `<!DOCTYPE html>` document, with sane defaults (`UTF-8` charset, a responsive viewport meta tag, and a `<title>`).

```ts
Document({
  title: "My Page",
  lang: "en",
  head: [Element("link", { rel: "stylesheet", href: "/styles.css" })],
  body: [Element("main", null, "Hello")],
});
```

### `EmbeddedJS(code, props?)` / `EmbeddedCSS(code, props?)`

Convenience wrappers around `Element("script", ...)` / `Element("style", ...)`.

They also support loading an external file's contents in place of inline code, using a `LOAD("relative/path")` sentinel string:

```ts
EmbeddedJS(`LOAD("client-bundle.js")`);
```

This is resolved relative to a `swiftSSRScriptsRoot` (or `SwiftSSRScriptsRoot`) path declared in your project's `package.json`:

```json
{
  "swiftSSRScriptsRoot": "dist/client"
}
```

Paths are sandboxed to `swiftSSRScriptsRoot`: absolute paths are rejected, and any resolved path that would land outside that directory (e.g. `LOAD("../../.env")`) returns `null` instead of reading the file. That said, still treat `LOAD(...)` strings as code you write, not as something to build from request data or user input — the sandbox stops path traversal, not intentional misuse of a path you constructed from untrusted input.

### `GenerateSitemap(origin, paths)`

Builds a `sitemap.xml`-style string from a list of paths:

```ts
GenerateSitemap("https://example.com", ["/", "/about", "/blog"]);
```

`origin` and each path are inserted as regular (escaped) text children, so `&`, `<`, `>`, etc. in a path no longer produce invalid XML.

## Styling and class names

- `style` accepts a `CSSProps` object with camelCase keys (`backgroundColor`, `fontSize`, etc.); these are converted to kebab-case and joined into a single inline `style` attribute.
- `className` accepts the same shapes as the popular `classnames` package: strings, numbers, arrays (including nested), and objects mapping class name → boolean.

```ts
Element("div", {
  className: ["card", { active: isActive, "card--large": size === "lg" }],
  style: { backgroundColor: "#fff", padding: "1rem" },
});
```

## Known limitations

- No built-in streaming — `Element`/`Render`/`Document` build the full string in memory before returning.
- `LOAD("...")` is sandboxed against path traversal, but the sandbox check is path-based, not permissions-based — it still trusts whatever file lives inside `swiftSSRScriptsRoot`. Don't point `swiftSSRScriptsRoot` at a directory containing anything sensitive.
- `<script>`/`<style>` content is intentionally never HTML-escaped (it's code, not text) and is only guarded against accidentally closing its own tag early. If you build script/style bodies from untrusted input, you're responsible for making that input safe as *code*, not just as *HTML* — `RawHTML`/script-body escaping is a different problem than the DOM-injection problem `Render` solves for ordinary elements.

## Contributing

This is an internal tool. Open an issue or PR with a clear description of the change and, where relevant, a before/after example of the rendered output.

## License

MIT