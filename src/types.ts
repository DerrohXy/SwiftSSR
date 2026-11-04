/**
 * Brand attached to every node SwiftSSR creates. `Symbol.for` makes it survive
 * duplicate copies of the package, and symbol keys never survive
 * JSON.stringify/parse, so attacker-supplied JSON can't impersonate a node
 * (e.g. `{ kind: "text", raw: true, value: "<script>..." }`).
 */
export const NODE_BRAND = Symbol.for("swiftssr.node");

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export type HTMLSvgTag =
    | "svg"
    | "path"
    | "circle"
    | "ellipse"
    | "line"
    | "polygon"
    | "polyline"
    | "rect"
    | "g"
    | "defs"
    | "clipPath"
    | "stop"
    | "linearGradient"
    | "radialGradient"
    | "text"
    | "tspan"
    | "use"
    | "symbol"
    | "mask"
    | "filter"
    | "pattern"
    | "image"
    | "foreignObject"
    | "marker"
    | "desc";

export type HTMLElementTag =
    | HTMLSvgTag
    | "a"
    | "abbr"
    | "address"
    | "area"
    | "article"
    | "aside"
    | "audio"
    | "b"
    | "base"
    | "bdi"
    | "bdo"
    | "blockquote"
    | "body"
    | "br"
    | "button"
    | "canvas"
    | "caption"
    | "cite"
    | "code"
    | "col"
    | "colgroup"
    | "data"
    | "datalist"
    | "dd"
    | "del"
    | "details"
    | "dfn"
    | "dialog"
    | "div"
    | "dl"
    | "dt"
    | "em"
    | "embed"
    | "fieldset"
    | "figcaption"
    | "figure"
    | "footer"
    | "form"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "head"
    | "header"
    | "hgroup"
    | "hr"
    | "html"
    | "i"
    | "iframe"
    | "img"
    | "input"
    | "ins"
    | "kbd"
    | "label"
    | "legend"
    | "li"
    | "link"
    | "main"
    | "map"
    | "mark"
    | "menu"
    | "meta"
    | "meter"
    | "nav"
    | "noscript"
    | "object"
    | "ol"
    | "optgroup"
    | "option"
    | "output"
    | "p"
    | "picture"
    | "pre"
    | "progress"
    | "q"
    | "rp"
    | "rt"
    | "ruby"
    | "s"
    | "samp"
    | "script"
    | "search"
    | "section"
    | "select"
    | "slot"
    | "small"
    | "source"
    | "span"
    | "strong"
    | "style"
    | "sub"
    | "summary"
    | "sup"
    | "table"
    | "tbody"
    | "td"
    | "template"
    | "textarea"
    | "tfoot"
    | "th"
    | "thead"
    | "time"
    | "title"
    | "tr"
    | "track"
    | "u"
    | "ul"
    | "var"
    | "video"
    | "wbr";

/** Tags used by the built-in sitemap generator (XML, not HTML). */
export type XMLSitemapTag =
    | "urlset"
    | "url"
    | "loc"
    | "lastmod"
    | "changefreq"
    | "priority";

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

/**
 * Numbers are allowed: unitless properties (opacity, zIndex, flex, ...) and 0
 * are emitted as-is, everything else gets `px`.
 */
export type CSSValue = string | number | null | undefined | false;

type CSSPropertyName =
    | "background"
    | "backgroundAttachment"
    | "backgroundClip"
    | "backgroundColor"
    | "backgroundImage"
    | "backgroundPosition"
    | "backgroundRepeat"
    | "backgroundSize"
    | "border"
    | "borderBottom"
    | "borderBottomColor"
    | "borderBottomLeftRadius"
    | "borderBottomRightRadius"
    | "borderBottomStyle"
    | "borderBottomWidth"
    | "borderCollapse"
    | "borderColor"
    | "borderLeft"
    | "borderLeftColor"
    | "borderLeftStyle"
    | "borderLeftWidth"
    | "borderRadius"
    | "borderRight"
    | "borderRightColor"
    | "borderRightStyle"
    | "borderRightWidth"
    | "borderSpacing"
    | "borderStyle"
    | "borderTop"
    | "borderTopColor"
    | "borderTopLeftRadius"
    | "borderTopRightRadius"
    | "borderTopStyle"
    | "borderTopWidth"
    | "borderWidth"
    | "boxShadow"
    | "boxSizing"
    | "clear"
    | "display"
    | "float"
    | "width"
    | "height"
    | "minWidth"
    | "minHeight"
    | "maxWidth"
    | "maxHeight"
    | "padding"
    | "paddingTop"
    | "paddingLeft"
    | "paddingBottom"
    | "paddingRight"
    | "margin"
    | "marginTop"
    | "marginLeft"
    | "marginRight"
    | "marginBottom"
    | "position"
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "inset"
    | "zIndex"
    | "overflow"
    | "overflowX"
    | "overflowY"
    | "visibility"
    | "color"
    | "fontFamily"
    | "fontSize"
    | "fontStyle"
    | "fontVariant"
    | "fontWeight"
    | "letterSpacing"
    | "lineHeight"
    | "textAlign"
    | "textDecoration"
    | "textOverflow"
    | "textTransform"
    | "textShadow"
    | "whiteSpace"
    | "wordBreak"
    | "verticalAlign"
    | "alignItems"
    | "alignContent"
    | "alignSelf"
    | "justifyContent"
    | "justifyItems"
    | "justifySelf"
    | "flex"
    | "flexBasis"
    | "flexDirection"
    | "flexFlow"
    | "flexGrow"
    | "flexShrink"
    | "flexWrap"
    | "gap"
    | "rowGap"
    | "columnGap"
    | "grid"
    | "gridArea"
    | "gridAutoFlow"
    | "gridColumn"
    | "gridRow"
    | "gridTemplate"
    | "gridTemplateAreas"
    | "gridTemplateColumns"
    | "gridTemplateRows"
    | "order"
    | "placeItems"
    | "placeContent"
    | "cursor"
    | "animation"
    | "animationDelay"
    | "animationDirection"
    | "animationDuration"
    | "animationFillMode"
    | "animationIterationCount"
    | "animationName"
    | "animationPlayState"
    | "animationTimingFunction"
    | "transition"
    | "transitionDelay"
    | "transitionDuration"
    | "transitionProperty"
    | "transitionTimingFunction"
    | "transform"
    | "transformOrigin"
    | "opacity"
    | "pointerEvents"
    | "resize"
    | "userSelect"
    | "objectFit"
    | "objectPosition"
    | "aspectRatio"
    | "content"
    | "filter"
    | "backdropFilter"
    | "listStyle"
    | "listStyleType"
    | "outline"
    | "outlineOffset"
    | "willChange"
    | "scrollBehavior"
    | "mixBlendMode"
    | "fill"
    | "stroke"
    | "strokeWidth";

/**
 * Named properties give autocomplete; the index signature still accepts
 * anything else (custom properties like `--brand`, vendor prefixes like
 * `WebkitTransition`, new CSS features).
 */
export type CSSProps = { [K in CSSPropertyName]?: CSSValue } & {
    [key: string]: CSSValue;
};

export type ClassValue =
    | string
    | number
    | Record<string, unknown>
    | ClassValue[]
    | null
    | undefined
    | false;

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

/** `raw: true` = trusted markup/code, NOT escaped on render. */
export type SwiftSSRTextNode = {
    readonly [NODE_BRAND]: true;
    kind: "text";
    value: string;
    raw: boolean;
};

export type SwiftSSRElementNode = {
    readonly [NODE_BRAND]: true;
    kind: "element";
    tag: string;
    props: SwiftSSRHTMLElementProps | null;
    children: SwiftSSRElement[];
};

/** Result of `<>...</>` / `Fragment()`: children with no wrapper tag. */
export type SwiftSSRFragmentNode = {
    readonly [NODE_BRAND]: true;
    kind: "fragment";
    children: SwiftSSRElement[];
};

export type SwiftSSRElement =
    | SwiftSSRTextNode
    | SwiftSSRElementNode
    | SwiftSSRFragmentNode;

export type SwiftSSRChild =
    | SwiftSSRElement
    | string
    | number
    | bigint
    | null
    | undefined
    | boolean;

export type SwiftSSRChildren = SwiftSSRChild | SwiftSSRChildren[];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type AttrValue = string | number | boolean | null | undefined;

/** Inline event handlers are *strings* in SSR output (no functions). */
type EventAttributes = { [K: `on${string}`]: string | undefined };
type DataAttributes = { [K: `data-${string}`]: AttrValue };
type AriaAttributes = { [K: `aria-${string}`]: AttrValue };
/** htmx / Alpine style attributes. */
type FrameworkAttributes = {
    [K: `hx-${string}`]: AttrValue;
    [K: `x-${string}`]: AttrValue;
};

export interface GlobalAttributes {
    id?: string;
    class?: ClassValue;
    className?: ClassValue;
    style?: CSSProps | string;
    title?: string;
    lang?: string;
    dir?: "ltr" | "rtl" | "auto";
    hidden?: boolean | "hidden" | "until-found" | "true" | "false";
    tabindex?: number | string;
    tabIndex?: number | string;
    role?: string;
    slot?: string;
    part?: string;
    accesskey?: string;
    autocapitalize?:
        | "off"
        | "none"
        | "on"
        | "sentences"
        | "words"
        | "characters";
    autofocus?: boolean;
    contenteditable?: boolean | "true" | "false" | "plaintext-only";
    draggable?: boolean | "true" | "false";
    enterkeyhint?:
        | "enter"
        | "done"
        | "go"
        | "next"
        | "previous"
        | "search"
        | "send";
    inert?: boolean;
    inputmode?:
        | "none"
        | "text"
        | "decimal"
        | "numeric"
        | "tel"
        | "search"
        | "email"
        | "url";
    is?: string;
    nonce?: string;
    popover?: boolean | "auto" | "manual";
    spellcheck?: boolean | "true" | "false";
    translate?: "yes" | "no";
    children?: SwiftSSRChildren;
    key?: string | number;
    /** Escape hatch for any attribute not covered by the types. */
    attrs?: Record<string, AttrValue>;
}

export type GlobalProps = GlobalAttributes &
    EventAttributes &
    DataAttributes &
    AriaAttributes &
    FrameworkAttributes;

/**
 * Permissive props type used by the runtime functions (`Element`, ...). The
 * strict, per-tag types used for JSX checking live in `IntrinsicElementProps`.
 */
export type SwiftSSRHTMLElementProps = GlobalProps & { [key: string]: unknown };

type CrossOrigin = "anonymous" | "use-credentials" | "";
type ReferrerPolicy =
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
type FormControl = {
    name?: string;
    form?: string;
    disabled?: boolean;
    required?: boolean;
    autocomplete?: string;
};

export type SvgProps = GlobalProps & {
    viewBox?: string;
    xmlns?: string;
    width?: string | number;
    height?: string | number;
    x?: string | number;
    y?: string | number;
    x1?: string | number;
    x2?: string | number;
    y1?: string | number;
    y2?: string | number;
    cx?: string | number;
    cy?: string | number;
    r?: string | number;
    rx?: string | number;
    ry?: string | number;
    d?: string;
    points?: string;
    transform?: string;
    fill?: string;
    stroke?: string;
    opacity?: string | number;
    preserveAspectRatio?: string;
    href?: string;
    offset?: string | number;
    // camelCase aliases are converted to kebab-case attributes on render
    strokeWidth?: string | number;
    strokeLinecap?: "butt" | "round" | "square";
    strokeLinejoin?: "miter" | "round" | "bevel";
    strokeDasharray?: string;
    strokeDashoffset?: string | number;
    strokeOpacity?: string | number;
    fillOpacity?: string | number;
    fillRule?: "nonzero" | "evenodd";
    clipRule?: "nonzero" | "evenodd";
    clipPath?: string;
    stopColor?: string;
    stopOpacity?: string | number;
    textAnchor?: "start" | "middle" | "end";
    "stroke-width"?: string | number;
};

interface ElementSpecificProps {
    a: GlobalProps & {
        href?: string;
        target?: "_self" | "_blank" | "_parent" | "_top";
        rel?: string;
        download?: boolean | string;
        hreflang?: string;
        type?: string;
        ping?: string;
        referrerpolicy?: ReferrerPolicy;
    };
    img: GlobalProps & {
        src?: string;
        alt?: string;
        width?: string | number;
        height?: string | number;
        srcset?: string;
        sizes?: string;
        loading?: "lazy" | "eager";
        decoding?: "sync" | "async" | "auto";
        fetchpriority?: "high" | "low" | "auto";
        crossorigin?: CrossOrigin;
        referrerpolicy?: ReferrerPolicy;
        usemap?: string;
        ismap?: boolean;
    };
    input: GlobalProps &
        FormControl & {
            type?: string;
            value?: string | number;
            placeholder?: string;
            checked?: boolean;
            readonly?: boolean;
            min?: string | number;
            max?: string | number;
            step?: string | number;
            pattern?: string;
            minlength?: number;
            maxlength?: number;
            multiple?: boolean;
            accept?: string;
            list?: string;
            size?: number;
            src?: string;
            alt?: string;
            width?: string | number;
            height?: string | number;
        };
    button: GlobalProps &
        FormControl & {
            type?: "button" | "submit" | "reset";
            value?: string | number;
            formaction?: string;
            formmethod?: "get" | "post" | "dialog";
            formenctype?: string;
            formnovalidate?: boolean;
            formtarget?: string;
        };
    form: GlobalProps & {
        action?: string;
        method?: "get" | "post" | "dialog";
        enctype?: string;
        target?: string;
        novalidate?: boolean;
        autocomplete?: string;
        name?: string;
        "accept-charset"?: string;
    };
    label: GlobalProps & { for?: string; htmlFor?: string; form?: string };
    link: GlobalProps & {
        rel?: string;
        href?: string;
        as?: string;
        type?: string;
        media?: string;
        crossorigin?: CrossOrigin;
        integrity?: string;
        sizes?: string;
        hreflang?: string;
        referrerpolicy?: ReferrerPolicy;
        fetchpriority?: "high" | "low" | "auto";
        imagesrcset?: string;
        imagesizes?: string;
    };
    meta: GlobalProps & {
        name?: string;
        content?: string;
        charset?: string;
        property?: string;
        "http-equiv"?: string;
        httpEquiv?: string;
        media?: string;
    };
    script: GlobalProps & {
        src?: string;
        type?: string;
        async?: boolean;
        defer?: boolean;
        nomodule?: boolean;
        crossorigin?: CrossOrigin;
        integrity?: string;
        referrerpolicy?: ReferrerPolicy;
        fetchpriority?: "high" | "low" | "auto";
    };
    style: GlobalProps & { media?: string; type?: string };
    textarea: GlobalProps &
        FormControl & {
            rows?: number;
            cols?: number;
            placeholder?: string;
            readonly?: boolean;
            wrap?: "hard" | "soft" | "off";
            minlength?: number;
            maxlength?: number;
        };
    select: GlobalProps & FormControl & { multiple?: boolean; size?: number };
    option: GlobalProps & {
        value?: string | number;
        selected?: boolean;
        disabled?: boolean;
        label?: string;
    };
    iframe: GlobalProps & {
        src?: string;
        srcdoc?: string;
        name?: string;
        width?: string | number;
        height?: string | number;
        sandbox?: string;
        allow?: string;
        allowfullscreen?: boolean;
        loading?: "lazy" | "eager";
        referrerpolicy?: ReferrerPolicy;
    };
    video: GlobalProps & {
        src?: string;
        controls?: boolean;
        autoplay?: boolean;
        loop?: boolean;
        muted?: boolean;
        playsinline?: boolean;
        poster?: string;
        preload?: "none" | "metadata" | "auto";
        width?: string | number;
        height?: string | number;
        crossorigin?: CrossOrigin;
    };
    audio: GlobalProps & {
        src?: string;
        controls?: boolean;
        autoplay?: boolean;
        loop?: boolean;
        muted?: boolean;
        preload?: "none" | "metadata" | "auto";
        crossorigin?: CrossOrigin;
    };
    source: GlobalProps & {
        src?: string;
        srcset?: string;
        type?: string;
        media?: string;
        sizes?: string;
        width?: string | number;
        height?: string | number;
    };
    td: GlobalProps & { colspan?: number; rowspan?: number; headers?: string };
    th: GlobalProps & {
        colspan?: number;
        rowspan?: number;
        headers?: string;
        scope?: "row" | "col" | "rowgroup" | "colgroup";
    };
    col: GlobalProps & { span?: number };
    colgroup: GlobalProps & { span?: number };
    ol: GlobalProps & { start?: number; reversed?: boolean; type?: string };
    li: GlobalProps & { value?: number };
    details: GlobalProps & { open?: boolean; name?: string };
    dialog: GlobalProps & { open?: boolean };
    time: GlobalProps & { datetime?: string };
    progress: GlobalProps & { value?: number; max?: number };
    meter: GlobalProps & {
        value?: number;
        min?: number;
        max?: number;
        low?: number;
        high?: number;
        optimum?: number;
    };
    base: GlobalProps & { href?: string; target?: string };
}

/** What `JSX.IntrinsicElements` is built from. */
export type IntrinsicElementProps = {
    [K in HTMLElementTag]: K extends keyof ElementSpecificProps
        ? ElementSpecificProps[K]
        : K extends HTMLSvgTag
          ? SvgProps
          : GlobalProps;
};
