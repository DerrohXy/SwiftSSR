# SwiftSSR

A small, dependency-free server-side rendering library for Node.js. Build pages with plain function calls or JSX, then serialize them to HTML (or XML) for Express, Fastify, or the bare `http` module.

- **Safe by default.** Text is escaped, URLs are checked, attribute names are validated, and nodes can't be forged from JSON.
- **JSX support** through the automatic runtime, including fragments and typed components.
- **Streaming** with proper backpressure.
- **HTML and XML** output (sitemaps, feeds).
- **Typed**: per-element prop types, with `data-*`, `aria-*`, `hx-*`, `x-*` and `on*` attributes.

Requires Node.js 18+ and `@types/node` for TypeScript users.

---

## Install

```bash
npm install swiftssr
```

### Package exports

The JSX runtimes must be exposed as entry points:

```json
{
    "type": "module",
    "exports": {
        ".": "./dist/index.js",
        "./jsx-runtime": "./dist/jsx-runtime.js",
        "./jsx-dev-runtime": "./dist/jsx-dev-runtime.js"
    }
}
```

### tsconfig (for projects using JSX)

```json
{
    "compilerOptions": {
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "strict": true,
        "jsx": "react-jsx",
        "jsxImportSource": "swiftssr"
    }
}
```

Use `"jsx": "react-jsxdev"` in development if you want the dev runtime.

---

## Quick start

### Express

```tsx
import express from "express";
import { Document, SendHTML } from "swiftssr";

const app = express();

function Greeting({ name }: { name: string }) {
    return <h1 className="title">Hello, {name}!</h1>;
}

app.get("/", (req, res) => {
    SendHTML(
        res,
        Document({
            title: "Home",
            body: <Greeting name={String(req.query.name ?? "world")} />,
        }),
    );
});

app.listen(3000);
```

`req.query.name` is user input and is safe here: string children are always escaped.

### Without JSX

```ts
import { Element as h, Render } from "swiftssr";

const html = Render(
    h("ul", { className: "list" }, h("li", null, "One"), h("li", null, "Two")),
);
// <ul class="list"><li>One</li><li>Two</li></ul>
```

`Element(...)` returns a node tree, **not** a string. Call `Render()` to serialize it.

---

## Core concepts

### Nodes

Every element, text value and fragment is a branded node object. Anything you pass as a child is converted like this:

| Child                         | Result                               |
| ----------------------------- | ------------------------------------ |
| `string`, `number`, `bigint`  | Text node, **escaped** on render     |
| `null`, `undefined`, booleans | Skipped                              |
| Arrays (any depth)            | Flattened                            |
| Nodes / fragments             | Used as-is (fragments are flattened) |
| Anything else                 | **Throws** a `TypeError`             |

Throwing on unknown objects catches mistakes like rendering an un-awaited `Promise`, and it means look-alike JSON can never be treated as trusted markup.

### Trusted markup

To insert markup that must not be escaped, wrap it explicitly:

```ts
import { RawHTML } from "swiftssr";

<div>{RawHTML(markdownToHtml(post.body))}</div>
```

Only use `RawHTML` on content you generated or sanitized. Never wrap raw user input in it.

### Components

A component is a function that receives props and returns anything renderable: an element, a string, an array, or `null`. Non-element results are wrapped in a fragment.

```tsx
function List({ items }: { items: string[] }) {
    return items.map((item) => <li>{item}</li>);
}
```

Fragments work with `<>...</>` or `Fragment({ children })`.

---

## Attributes

Attributes are rendered with these rules:

| Input                                                            | Output                                                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `className` / `class`                                            | Merged into one `class` attribute (strings, arrays, `{ name: condition }` objects)                                 |
| `style` object                                                   | Kebab-cased declarations; numbers get `px` except unitless properties (`opacity`, `zIndex`, `flex`, ...) and `0`   |
| `style` string                                                   | Used as-is (escaped for the attribute)                                                                             |
| `--custom-prop`                                                  | Name preserved exactly                                                                                             |
| `WebkitTransition`, `msTransform`                                | `-webkit-transition`, `-ms-transform`                                                                              |
| Boolean attributes (`disabled`, `hidden`, ...)                   | Bare name when true; **omitted** for `false` / `"false"` / `0`; string values like `hidden="until-found"` are kept |
| `contenteditable`, `draggable`, `spellcheck`, `aria-*`, `data-*` | `true`/`false` rendered as `"true"`/`"false"`                                                                      |
| `htmlFor`, `tabIndex`, `httpEquiv`, `acceptCharset`              | `for`, `tabindex`, `http-equiv`, `accept-charset`                                                                  |
| SVG camelCase (`strokeWidth`, `fillRule`, ...)                   | `stroke-width`, `fill-rule`, ... (`viewBox` is left as-is)                                                         |
| `null`, `undefined`, functions, symbols, objects                 | Dropped                                                                                                            |
| Invalid attribute names                                          | Dropped (a warning is logged outside production)                                                                   |

Event handlers are **strings** in SSR output (`onclick="..."`), not functions. Inline handlers conflict with strict CSPs, so prefer attaching listeners from a script.

For attributes not covered by the types, use the escape hatch:

```tsx
<div attrs={{ "x-on:click.away": "close()" }} />
```

### URL safety

`href`, `src`, `action`, `formaction`, `poster`, `cite`, `data`, `background`, `manifest` and `xlink:href` are checked. Relative URLs are allowed, as are the schemes `http`, `https`, `mailto`, `tel` and `sms`, plus `data:image/...` (PNG, GIF, JPEG, WebP, AVIF, BMP, ICO; not SVG). Anything else, such as `javascript:`, is dropped. You can also call `IsSafeURL(value)` directly.

Adjust the allowed schemes with `Configure`:

```ts
Configure({ allowedUrlSchemes: ["http", "https", "mailto", "tel", "ftp"] });
```

---

## Documents

```ts
import { Document, DocumentNode } from "swiftssr";

const html = Document({
  title: "My page",
  lang: "en",
  head: <link rel="stylesheet" href="/app.css" />,
  body: <main>...</main>,
  htmlProps: { className: "dark" },
  bodyProps: { id: "top" },
});
```

- `Document(params)` returns a string beginning with `<!DOCTYPE html>`.
- `DocumentNode(params)` returns the node tree, so you can stream it.
- Defaults are added for `<meta charset>`, the viewport meta, and `<title>`. If your `head` contains its own `<title>`, charset meta or viewport meta, it replaces the default instead of duplicating it.

---

## Streaming

Large pages can be streamed instead of built as one string. `RenderToReadable` returns a Node `Readable`, so backpressure is handled for you.

```tsx
import { DocumentNode, StreamHTML } from "swiftssr";

app.get("/big", (req, res) => {
    StreamHTML(res, DocumentNode({ title: "Big", body: <BigPage /> }));
});
```

- `StreamHTML(res, node, { status?, doctype? })` sets the status and `Content-Type`, then pipes the render to the response. `doctype` defaults to `true`.
- `SendHTML(res, html, status?)` sends a finished string with `Content-Type` and `Content-Length`.
- `RenderToReadable(node, { xml?, doctype? })` returns the stream if you want to pipe it yourself.

Note that components run before streaming starts (the tree is built eagerly); streaming reduces peak memory and time to first byte of serialization, not component execution time.

---

## Embedding scripts and styles

Content of `<script>` and `<style>` is treated as **trusted code** and is not escaped. It is guarded so it can't close its own tag early (`</script` is rewritten to `<\/script` inside script tags, `</style` inside style tags).

```tsx
<script>{`console.log("ready")`}</script>;

EmbeddedJS("console.log('ready')");
EmbeddedCSS("body { margin: 0 }");
```

### Including files

Files are read from a sandboxed **scripts root**, set with `Configure({ scriptsRoot })` or `swiftSSRScriptsRoot` in `package.json`.

```json
{ "swiftSSRScriptsRoot": "./public/inline" }
```

```tsx
import { LoadJS, LoadCSS } from "swiftssr";

<head>
    {LoadCSS("critical.css")}
    {LoadJS("analytics.js")}
</head>;
```

`LoadJS` / `LoadCSS` throw if the file can't be loaded. The sandbox rejects absolute paths, NUL bytes, `..` escapes and symlinks that point outside the root.

The older implicit form still works by default: a script or style whose only text is `LOAD("file.js")` is replaced with that file's content. Disable it with `Configure({ implicitLoad: false })` if you'd rather use only the explicit helpers.

File contents are cached in memory when `NODE_ENV === "production"` (override with `cacheFiles`), and re-read on every render otherwise so edits show up during development.

### Passing data to the browser

Never build script text by string-concatenating user data. Use `JsonScript`, which escapes `<`, `>`, `&` and U+2028/2029:

```tsx
<head>{JsonScript({ user, flags }, { id: "bootstrap" })}</head>
// <script type="application/json" id="bootstrap">{"user":...}</script>
```

```js
const data = JSON.parse(document.getElementById("bootstrap").textContent);
```

---

## XML and sitemaps

```ts
import { XmlElement, Render, GenerateSitemap } from "swiftssr";

const xml = Render(XmlElement("feed", null, XmlElement("link", null)), {
    xml: true,
});
// <feed><link/></feed>
```

In XML mode, empty elements self-close (`<link/>`) and the HTML void/boolean attribute rules are not applied, which is what RSS, Atom and sitemaps need.

```ts
const sitemap = GenerateSitemap("https://example.com/", [
    "/",
    "/about",
    {
        path: "/blog/hello world",
        lastmod: new Date("2026-10-01"),
        priority: 0.8,
        changefreq: "weekly",
    },
]);
```

- The origin's trailing slash is normalized and paths are percent-encoded (existing `%XX` sequences are kept).
- `lastmod` is only emitted when you provide it.
- `priority` is clamped to 0 to 1.
- More than 50,000 URLs throws a `RangeError`; split the sitemap.

```ts
app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(GenerateSitemap(origin, paths));
});
```

---

## Configuration

```ts
import { Configure } from "swiftssr";

Configure({
    scriptsRoot: "./public/inline", // default: swiftSSRScriptsRoot in package.json
    cacheFiles: true, // default: NODE_ENV === "production"
    implicitLoad: true, // LOAD("file") support
    allowedUrlSchemes: ["http", "https", "mailto", "tel", "sms"],
});
```

Calling `Configure` clears the file cache and re-resolves the scripts root.

---

## API reference

| Export                                                   | Description                             |
| -------------------------------------------------------- | --------------------------------------- |
| `Element(tag, props, ...children)`                       | Build an HTML/SVG element node          |
| `XmlElement(tag, props, ...children)`                    | Build an element for XML output         |
| `Fragment({ children })`                                 | Children without a wrapper              |
| `Render(node \| node[], { xml? })`                       | Serialize to a string                   |
| `RenderToReadable(node, { xml?, doctype? })`             | Serialize to a `Readable` stream        |
| `StreamHTML(res, node, { status?, doctype? })`           | Stream a node to a Node response        |
| `SendHTML(res, html, status?)`                           | Send an HTML string                     |
| `Document(params)` / `DocumentNode(params)`              | Full page as string / node tree         |
| `RawHTML(string)`                                        | Trusted, unescaped text                 |
| `EscapeHTML(value)`                                      | HTML-escape any value                   |
| `classNames(...)`                                        | Resolve class values to a string        |
| `IsSafeURL(string)`                                      | Check a URL against the allowed schemes |
| `IsSwiftSSRNode(value)`                                  | True only for genuine nodes             |
| `EmbeddedJS(code, props?)` / `EmbeddedCSS(code, props?)` | Inline script / style                   |
| `LoadJS(file, props?)` / `LoadCSS(file, props?)`         | Inline a file from the scripts root     |
| `LoadEmbeddedFile(path)`                                 | Sandboxed file read (`string \| null`)  |
| `JsonScript(data, props?)`                               | Safe JSON data block                    |
| `GenerateSitemap(origin, entries)`                       | Sitemap XML string                      |
| `Configure(options)`                                     | Global settings                         |

---

## Security model

What the library protects you from:

- **Text injection:** all string and number children are escaped.
- **Forged trusted nodes:** only objects created by the library are treated as nodes; JSON can't carry the symbol brand.
- **Attribute injection:** names containing whitespace, quotes, `<`, `>`, `/`, `=` or control characters are dropped, and values are escaped.
- **Script URLs:** unsafe schemes are dropped from URL attributes.
- **Path traversal:** file loading is confined to the scripts root, including through symlinks.
- **Early tag closing** in inline script/style content.

What it does **not** do for you:

- It does not sanitize `RawHTML`, `<script>` or `<style>` content, or `style` strings. Those are trusted by design.
- It does not sanitize CSS values inside `style` objects. Don't put unvalidated user input into style values (a `;` can add declarations).
- It does not set a Content-Security-Policy. Inline event handler strings and inline scripts need a compatible policy; use the `nonce` prop on your own script/style tags if you add one.

---

## Migrating from the previous version

| Change                                                                         | Action                                                                                                           |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Nodes are branded; plain objects throw as children                             | Wrap trusted markup in `RawHTML(...)`; don't pass arbitrary objects                                              |
| `ValidHTML` removed                                                            | It parsed HTML as XML and needed a browser `DOMParser`. Use a real parser (e.g. `parse5`) if you need validation |
| `disabled="false"` and similar are now omitted                                 | Pass real booleans; rely on the new behavior                                                                     |
| `false` for `aria-*`, `data-*`, `contenteditable`, etc. renders `"false"`      | No action; this is the correct HTML                                                                              |
| `GenerateSitemap` takes entries and no longer stamps today's date as `lastmod` | Pass `lastmod` where you know it                                                                                 |
| Sitemap tags removed from `HTMLElementTag`                                     | Use `XmlElement` for XML                                                                                         |
| `JSX` namespace is exported from `jsx-runtime` (no longer global)              | Set `jsxImportSource` as shown above                                                                             |
| Imports use `.js` extensions                                                   | Use `moduleResolution: NodeNext` (or equivalent)                                                                 |
| `ElementClass` removed from `JSX`                                              | Not needed; function components work via `ElementType`                                                           |
| Unsafe URLs in `href` / `src` are now dropped                                  | Allow extra schemes through `Configure` if needed                                                                |

---

## Development

The repository contains `index.ts`, `types.ts`, `jsx-runtime.ts` and `jsx-dev-runtime.ts`. Compile with `tsc` using `module: NodeNext` and `strict: true`. A good set of regression tests covers escaping, forged nodes, attribute and URL handling, boolean and enumerated attributes, style keys, the scripts-root sandbox (including symlinks), fragments, XML mode and streaming.
