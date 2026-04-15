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

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T

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
  const edges = rows.filter((x) => x.kind === "edge")
  const nodes = new Map(rows.filter((x) => x.kind === "node").map((x) => [x.id, x]))
  const claims = rows.filter((x) => x.kind === "node" && x.type === "claim")
  return md("formalization-inventory.md", [
    `> ${quote}`,
    "",
    "## Formal Claims",
    "",
    table(
      ["Claim", "Support", "Refines", "Checked by", "State"],
      claims
        .filter((x) => x.id.startsWith("claim.runtime.") || x.id.startsWith("claim.normalization."))
        .map((claim) => [
          `\`${claim.id}\``,
          `${edges.filter((x) => ["proved_by", "specified_by"].includes(x.type) && x.from === claim.id).map((x) => `\`${x.to}\``).join(", ")}`,
          `${edges.filter((x) => x.type === "refines" && x.from === claim.id).map((x) => `\`${x.to}\``).join(", ")}`,
          `${edges.filter((x) => x.type === "checked_by" && x.from === claim.id).map((x) => `\`${x.to}\``).join(", ")}`,
          `\`${claim.state}\``,
        ]),
    ),
    "",
    "## Formal Profile Requirements",
    "",
    table(
      ["Profile", "Requires", "Covers"],
      edges
        .filter((x) => x.from === "profile.runtime_formal" && ["requires", "covers"].includes(x.type))
        .reduce(
          (acc, edge) => {
            const row = acc.get(edge.from || "") || { req: [] as string[], cov: [] as string[] }
            if (edge.type === "requires") row.req.push(`\`${edge.to}\``)
            if (edge.type === "covers") row.cov.push(`\`${edge.to}\``)
            acc.set(edge.from || "", row)
            return acc
          },
          new Map<string, { req: string[]; cov: string[] }>(),
        )
        .entries()
        .map(([id, row]) => [`\`${id}\``, row.req.join(", "), row.cov.join(", ")]),
    ),
  ])
}

const renderMatrix = (rows: Row[]) => {
  const nodes = rows.filter((x) => x.kind === "node")
  const edges = rows.filter((x) => x.kind === "edge")
  const profiles = nodes.filter((x) => x.type === "profile")
  return md("completeness-matrix.md", [
    `> ${quote}`,
    "",
    "## Profile Matrix",
    "",
    table(
      ["Profile", "Covers", "Requires", "Certified", "State"],
      profiles.map((profile) => [
        `\`${profile.id}\``,
        `${edges.filter((x) => x.type === "covers" && x.from === profile.id).map((x) => `\`${x.to}\``).join(", ")}`,
        `${edges.filter((x) => x.type === "requires" && x.from === profile.id).length}`,
        `${edges.filter((x) => x.type === "certifies" && x.to?.includes(profile.id.split(".").at(-1) || "")).length}`,
        `\`${profile.state}\``,
      ]),
    ),
    "",
    "## Artifact Totals",
    "",
    table(
      ["Type", "Count"],
      ["artifact", "claim", "surface", "profile", "report", "world"].map((type) => [
        type,
        `${nodes.filter((x) => x.type === type).length}`,
      ]),
    ),
  ])
}

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

const renderRust = async (rows: Row[]) => {
  const kit = await readJson<{
    messages: {
      discriminant: string
      variants: string[]
    }
    checkpoint: {
      required_fields: string[]
    }
    verdict: {
      status: {
        values: string[]
      }
    }
    ordering_rules: string[]
  }>("contracts/schema/conformance-kit.json")
  const runtime = await readJson<{
    determinism: {
      required: boolean
      inputs: string[]
    }
    observation: {
      required_common_fields: string[]
    }
    rust_notes: string[]
  }>("contracts/iut/runtime.json")
  const tui = await readJson<{
    rust_notes?: string[]
  }>("contracts/iut/tui.json")
  return md("rust-ergonomics-report.md", [
    `> ${quote}`,
    "",
    "## Envelope Properties",
    "",
    table(
      ["Property", "Value"],
      [
        ["conformance_discriminant", `\`${kit.messages.discriminant}\``],
        ["conformance_variants", `${kit.messages.variants.length}`],
        ["verdict_status_values", `${kit.verdict.status.values.join(", ")}`],
        ["runtime_common_fields", `${runtime.observation.required_common_fields.join(", ")}`],
        ["checkpoint_common_fields", `${kit.checkpoint.required_fields.join(", ")}`],
        ["deterministic_mode_required", `${runtime.determinism.required}`],
      ],
    ),
    "",
    "## Ordering Rules",
    "",
    ...kit.ordering_rules.map((x) => `- ${x}`),
    "",
    "## Rust Notes",
    "",
    ...runtime.rust_notes.map((x) => `- ${x}`),
    ...((tui.rust_notes || []).map((x) => `- ${x}`)),
  ])
}

const renderCoverage = (rows: Row[]) =>
  md("semantic-coverage-report.md", (() => {
    const nodes = rows.filter((x) => x.kind === "node")
    const edges = rows.filter((x) => x.kind === "edge")
    const profiles = nodes.filter((x) => x.type === "profile")
    const surfaces = nodes.filter((x) => x.type === "surface")
    const claims = nodes.filter((x) => x.type === "claim")
    const certified = claims.filter((x) => x.id.includes("source_certified"))
    const commuting = claims.filter((x) => x.id.includes(".commuting."))
    const coverage = [
      ["surfaces", `${surfaces.length}`],
      ["profiles", `${profiles.length}`],
      ["claims", `${claims.length}`],
      ["commuting_claims", `${commuting.length}`],
      ["source_certified_claims", `${certified.length}`],
      ["requires_edges", `${edges.filter((x) => x.type === "requires").length}`],
      ["checked_by_edges", `${edges.filter((x) => x.type === "checked_by").length}`],
      ["certifies_edges", `${edges.filter((x) => x.type === "certifies").length}`],
    ]
    return [
      `> ${quote}`,
      "",
      "## Coverage Summary",
      "",
      table(["Dimension", "Count"], coverage),
      "",
      "## Surface Coverage",
      "",
      table(
        ["Surface", "Profiles", "Claims"],
        surfaces.map((surface) => [
          `\`${surface.id}\``,
          `${edges.filter((x) => x.type === "covers" && x.to === surface.id).length}`,
          `${edges.filter((x) => x.type === "refines" && x.to === surface.id).length}`,
        ]),
      ),
      "",
      "## Claim Coverage",
      "",
      table(
        ["Claim", "Kind", "Checked by", "State"],
        claims.map((claim) => [
          `\`${claim.id}\``,
          `\`${String(claim.attrs?.kind || "")}\``,
          `${edges.filter((x) => x.type === "checked_by" && x.from === claim.id).length}`,
          `\`${claim.state}\``,
        ]),
      ),
    ]
  })())

const renderTcb = (rows: Row[]) =>
  md("tcb-inventory.md", (() => {
    const nodes = rows.filter((x) => x.kind === "node")
    const tcb = nodes.filter((x) => x.type === "artifact" && x.attrs?.tcb === true)
    return [
      `> ${quote}`,
      "",
      "## Trusted Elements",
      "",
      table(
        ["ID", "Path", "Assumption strata", "Note"],
        tcb.map((x) => [
          `\`${x.id}\``,
          x.path ? `\`${x.path}\`` : "",
          `\`${Array.isArray(x.attrs?.assumption_strata) ? x.attrs?.assumption_strata.join(",") : ""}\``,
          x.note || "",
        ]),
      ),
      "",
      "## Summary",
      "",
      table(
        ["Class", "Count"],
        [
          ["trusted_artifacts", `${tcb.length}`],
          ["abstraction_bound", `${tcb.filter((x) => Array.isArray(x.attrs?.assumption_strata) && x.attrs?.assumption_strata.includes("abstraction")).length}`],
          ["harness_bound", `${tcb.filter((x) => Array.isArray(x.attrs?.assumption_strata) && x.attrs?.assumption_strata.includes("harness")).length}`],
          ["environment_bound", `${tcb.filter((x) => Array.isArray(x.attrs?.assumption_strata) && x.attrs?.assumption_strata.includes("environment")).length}`],
          ["normalization_bound", `${tcb.filter((x) => Array.isArray(x.attrs?.assumption_strata) && x.attrs?.assumption_strata.includes("normalization")).length}`],
        ],
      ),
    ]
  })())

const targets = async () => {
  const rows = await readRows()
  return [
    [join(root, "claims-ledger.md"), renderClaims(rows)],
    [join(root, "formalization-inventory.md"), renderFormal(rows)],
    [join(root, "completeness-matrix.md"), renderMatrix(rows)],
    [join(root, "refinement-ledger.md"), renderRefine(rows)],
    [join(root, "rust-ergonomics-report.md"), await renderRust(rows)],
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
