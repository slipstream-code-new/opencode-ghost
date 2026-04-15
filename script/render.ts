#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"

type Row = {
  kind: "node" | "edge"
  id: string
  type: string
  class?: string
  state?: string
  title?: string
  path?: string
  note?: string
  owner?: string
  from?: string
  to?: string
  attrs?: Record<string, unknown>
}

const readRows = async () =>
  (await Bun.file(join(root, "graph/contract-graph.jsonl")).text())
    .split("\n")
    .filter(Boolean)
    .map((x) => JSON.parse(x) as Row)

const md = (title: string, body: string[]) => `# ${title}\n\n${body.join("\n")}\n`

const table = (head: string[], rows: string[][]) =>
  [
    `| ${head.join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n")

const quote = "Generated from `graph/contract-graph.jsonl`. Do not edit directly."

const renderClaims = (rows: Row[]) =>
  md("claims-ledger.md", [
    `> ${quote}`,
    "",
    table(
      ["ID", "Title", "State", "Class", "Note"],
      rows
        .filter((x) => x.kind === "node" && x.type === "claim")
        .map((x) => [`\`${x.id}\``, x.title || "", `\`${x.state}\``, `\`${x.class}\``, x.note || ""]),
    ),
  ])

const renderFormal = (rows: Row[]) => {
  const edges = rows.filter((x) => x.kind === "edge" && x.type === "covers")
  const nodes = new Map(rows.filter((x) => x.kind === "node").map((x) => [x.id, x]))
  return md("formalization-inventory.md", [
    `> ${quote}`,
    "",
    table(
      ["Profile", "Surface", "State", "Note"],
      edges
        .filter((x) => x.from === "profile.runtime_formal" || x.to === "surface.kernel")
        .map((x) => [
          `\`${x.from}\``,
          `\`${x.to}\``,
          `\`${nodes.get(x.from || "")?.state || x.state || "draft"}\``,
          nodes.get(x.to || "")?.note || x.note || "",
        ]),
    ),
  ])
}

const renderMatrix = (rows: Row[]) =>
  md("completeness-matrix.md", [
    `> ${quote}`,
    "",
    table(
      ["Entity", "Type", "Class", "State", "Path"],
      rows
        .filter((x) => x.kind === "node")
        .map((x) => [
          `\`${x.id}\``,
          `\`${x.type}\``,
          `\`${x.class}\``,
          `\`${x.state}\``,
          x.path ? `\`${x.path}\`` : "",
        ]),
    ),
  ])

const renderRefine = (rows: Row[]) => {
  const edges = rows.filter((x) => x.kind === "edge")
  const seed = edges.filter((x) => x.type === "seed_for")
  const cover = edges.filter((x) => x.type === "covers")
  return md("refinement-ledger.md", [
    `> ${quote}`,
    "",
    table(
      ["Surface", "Seed world", "Governing profile"],
      cover
        .map((x) => {
          const world = seed.find((y) => y.to === x.from)
          return [`\`${x.to}\``, world ? `\`${world.from}\`` : "", `\`${x.from}\``]
        })
        .filter((x) => x[0] !== "``"),
    ),
  ])
}

const renderRust = (rows: Row[]) =>
  md("rust-ergonomics-report.md", [
    `> ${quote}`,
    "",
    "## Seed Rust-facing obligations",
    "",
    ...rows
      .filter((x) => x.kind === "node" && (x.type === "claim" || x.type === "policy"))
      .map((x) => `- \`${x.id}\`: ${x.note || x.title || ""}`),
  ])

const renderCoverage = (rows: Row[]) =>
  md("semantic-coverage-report.md", [
    `> ${quote}`,
    "",
    "## Seed coverage dimensions",
    "",
    ...rows
      .filter((x) => x.kind === "node" && x.type === "surface")
      .map((x) => `- \`${x.id}\``),
  ])

const renderTcb = (rows: Row[]) =>
  md("tcb-inventory.md", [
    `> ${quote}`,
    "",
    "## Seed trusted elements",
    "",
    ...rows
      .filter(
        (x) =>
          x.kind === "node" &&
          ((x.type === "artifact" && x.id.startsWith("artifact.graph.")) || x.id.startsWith("report.")),
      )
      .map((x) => `- \`${x.id}\``),
  ])

const targets = async () => {
  const rows = await readRows()
  return [
    [join(root, "claims-ledger.md"), renderClaims(rows)],
    [join(root, "formalization-inventory.md"), renderFormal(rows)],
    [join(root, "completeness-matrix.md"), renderMatrix(rows)],
    [join(root, "refinement-ledger.md"), renderRefine(rows)],
    [join(root, "rust-ergonomics-report.md"), renderRust(rows)],
    [join(root, "semantic-coverage-report.md"), renderCoverage(rows)],
    [join(root, "tcb-inventory.md"), renderTcb(rows)],
  ] as const
}

const main = async () => {
  let bad = false
  for (const [path, want] of await targets()) {
    if (mode === "write") {
      await Bun.write(path, want)
      continue
    }
    const got = await Bun.file(path).text()
    if (got === want) continue
    console.error(`stale generated file: ${path}`)
    bad = true
  }
  if (bad) process.exit(1)
}

await main()
