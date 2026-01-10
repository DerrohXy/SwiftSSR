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
    | "title"
    | "defs"
    | "clipPath"
    | "stop"
    | "linearGradient"
    | "radialGradient";

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
    | "wbr"
    | "url"
    | "loc"
    | "lastmod"
    | "priority"
    | "urlset";

export type CSSProps = {
    // Background
    background?: string;
    backgroundAttachment?: "scroll" | "fixed" | "local" | string;
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundPosition?: string;
    backgroundRepeat?:
        | "repeat"
        | "repeat-x"
        | "repeat-y"
        | "no-repeat"
        | string;

    // Border
    border?: string;
    borderBottom?: string;
    borderBottomColor?: string;
    borderBottomStyle?:
        | "none"
        | "hidden"
        | "dotted"
        | "dashed"
        | "solid"
        | "double"
        | "groove"
        | "ridge"
        | "inset"
        | "outset"
        | string;
    borderBottomWidth?: string;
    borderColor?: string;
    borderLeft?: string;
    borderLeftColor?: string;
    borderLeftStyle?:
        | "none"
        | "hidden"
        | "dotted"
        | "dashed"
        | "solid"
        | "double"
        | "groove"
        | "ridge"
        | "inset"
        | "outset"
        | string;
    borderLeftWidth?: string;
    borderRadius?: string;
    borderRight?: string;
    borderRightColor?: string;
    borderRightStyle?:
        | "none"
        | "hidden"
        | "dotted"
        | "dashed"
        | "solid"
        | "double"
        | "groove"
        | "ridge"
        | "inset"
        | "outset"
        | string;
    borderRightWidth?: string;
    borderStyle?:
        | "none"
        | "hidden"
        | "dotted"
        | "dashed"
        | "solid"
        | "double"
        | "groove"
        | "ridge"
        | "inset"
        | "outset"
        | string;
    borderTop?: string;
    borderTopColor?: string;
    borderTopStyle?:
        | "none"
        | "hidden"
        | "dotted"
        | "dashed"
        | "solid"
        | "double"
        | "groove"
        | "ridge"
        | "inset"
        | "outset"
        | string;
    borderTopWidth?: string;
    borderWidth?: string;

    // Box & Display
    boxShadow?: string;
    boxSizing?: "border-box" | "content-box" | string;
    clear?: "none" | "left" | "right" | "both" | string;
    display?:
        | "none"
        | "block"
        | "inline"
        | "inline-block"
        | "flex"
        | "grid"
        | "inline-flex"
        | "inline-grid"
        | "contents"
        | "list-item"
        | "table"
        | "table-row"
        | "table-cell"
        | string;
    float?: "none" | "left" | "right" | "inline-start" | "inline-end" | string;
    width?: string;
    height?: string;
    minWidth?: string;
    minHeight?: string;
    maxWidth?: string;
    maxHeight?: string;
    padding?: string;
    paddingTop?: string;
    paddingLeft?: string;
    paddingBottom?: string;
    paddingRight?: string;
    margin?: string;
    marginTop?: string;
    marginLeft?: string;
    marginRight?: string;
    marginBottom?: string;

    // Position
    position?: "static" | "relative" | "absolute" | "fixed" | "sticky" | string;
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    zIndex?: number | string;

    // Overflow
    overflow?: "visible" | "hidden" | "scroll" | "auto" | string;
    overflowX?: "visible" | "hidden" | "scroll" | "auto" | string;
    overflowY?: "visible" | "hidden" | "scroll" | "auto" | string;

    // Visibility
    visibility?: "visible" | "hidden" | "collapse" | string;

    // Typography
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: "normal" | "italic" | "oblique" | string;
    fontVariant?: string;
    fontWeight?:
        | "normal"
        | "bold"
        | "bolder"
        | "lighter"
        | "100"
        | "200"
        | "300"
        | "400"
        | "500"
        | "600"
        | "700"
        | "800"
        | "900"
        | string;
    letterSpacing?: string;
    lineHeight?: string;
    textAlign?:
        | "left"
        | "right"
        | "center"
        | "justify"
        | "start"
        | "end"
        | string;
    textDecoration?:
        | "none"
        | "underline"
        | "overline"
        | "line-through"
        | string;
    textOverflow?: "clip" | "ellipsis" | string;
    textTransform?: "none" | "capitalize" | "uppercase" | "lowercase" | string;
    whiteSpace?: "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap" | string;

    // Flex
    alignItems?:
        | "stretch"
        | "center"
        | "flex-start"
        | "flex-end"
        | "baseline"
        | string;
    alignContent?:
        | "stretch"
        | "center"
        | "flex-start"
        | "flex-end"
        | "space-between"
        | "space-around"
        | string;
    alignSelf?:
        | "auto"
        | "stretch"
        | "center"
        | "flex-start"
        | "flex-end"
        | "baseline"
        | string;
    justifyContent?:
        | "flex-start"
        | "flex-end"
        | "center"
        | "space-between"
        | "space-around"
        | "space-evenly"
        | string;
    flexDirection?:
        | "row"
        | "row-reverse"
        | "column"
        | "column-reverse"
        | string;
    flexWrap?: "nowrap" | "wrap" | "wrap-reverse" | string;

    // Cursor
    cursor?:
        | "auto"
        | "default"
        | "pointer"
        | "wait"
        | "text"
        | "move"
        | "not-allowed"
        | "crosshair"
        | "zoom-in"
        | "zoom-out"
        | string;

    // Animation
    animationDirection?:
        | "normal"
        | "reverse"
        | "alternate"
        | "alternate-reverse"
        | string;
    animationFillMode?: "none" | "forwards" | "backwards" | "both" | string;
    animationPlayState?: "running" | "paused" | string;
    animationTimingFunction?:
        | "ease"
        | "linear"
        | "ease-in"
        | "ease-out"
        | "ease-in-out"
        | string;

    // Misc
    opacity?: string | number;
    pointerEvents?:
        | "auto"
        | "none"
        | "visiblePainted"
        | "visibleFill"
        | "visibleStroke"
        | "visible"
        | "painted"
        | "fill"
        | "stroke"
        | "all"
        | string;
    resize?: "none" | "both" | "horizontal" | "vertical" | string;
    userSelect?: "auto" | "text" | "none" | "contain" | "all" | string;

    // Any unknown props
    [key: string]: any;
};

export type ClassValue =
    | string
    | number
    | Record<string, boolean>
    | ClassValue[]
    | null
    | undefined;

export type HTMLElementProps = {
    style?: CSSProps;
    className?: ClassValue;
    [key: string]: any;
};
