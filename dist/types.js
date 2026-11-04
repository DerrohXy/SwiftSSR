/**
 * Brand attached to every node SwiftSSR creates. `Symbol.for` makes it survive
 * duplicate copies of the package, and symbol keys never survive
 * JSON.stringify/parse, so attacker-supplied JSON can't impersonate a node
 * (e.g. `{ kind: "text", raw: true, value: "<script>..." }`).
 */
export const NODE_BRAND = Symbol.for("swiftssr.node");
