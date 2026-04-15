#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"
const target = "evidence/traceability/semantic-freeze.json"

type Row = {
  kind: "node" | "edge"
  id: string
  type: string
  from?: string
  to?: string
}

const render = async () => {
  const rows = (await Bun.file(join(root, "graph/contract-graph.jsonl")).text())
    .split("\n")
    .filter(Boolean)
    .map((x) => JSON.parse(x) as Row)
  const nodes = rows.filter((x) => x.kind === "node")
  const edges = rows.filter((x) => x.kind === "edge")
  const surfaces = ["surface.runtime", "surface.tui", "surface.integrations", "surface.security"]
  const commutingClaims = new Set(
    nodes
      .filter((x) => x.type === "claim" && x.id.includes("commuting"))
      .map((x) => x.id.includes(".tui.") ? "surface.tui" : x.id.includes(".integrations.") ? "surface.integrations" : x.id.includes(".security.") ? "surface.security" : "surface.runtime"),
  )
  const certifiedClaims = new Set(
    nodes
      .filter((x) => x.type === "claim" && x.id.includes(".source_certified."))
      .map((x) => x.id.includes(".tui.") ? "surface.tui" : x.id.includes(".integrations.") ? "surface.integrations" : x.id.includes(".security.") ? "surface.security" : "surface.runtime"),
  )
  const profiles = ["profile.core_runtime", "profile.runtime_formal", "profile.tui_certified", "profile.integrations_canonical", "profile.security_critical"]
  const profileCoverage = profiles.map((id) => ({
    id,
    has_requirements: edges.some((x) => x.type === "requires" && x.from === id),
  }))
  const result = {
    stage: "bootstrap",
    metrics: {
      surfaces,
      commuting_covered_surfaces: surfaces.filter((x) => commutingClaims.has(x)),
      source_certified_surfaces: surfaces.filter((x) => certifiedClaims.has(x)),
      profiles: profileCoverage,
    },
    frozen:
      surfaces.every((x) => commutingClaims.has(x) && certifiedClaims.has(x)) &&
      profileCoverage.every((x) => x.has_requirements),
  }
  return `${JSON.stringify(result, null, 2)}\n`
}

const main = async () => {
  const want = await render()
  if (mode === "write") {
    await Bun.write(join(root, target), want)
    return
  }
  const got = await Bun.file(join(root, target)).text()
  if (got === want) return
  throw new Error(`stale semantic freeze report: ${target}`)
}

await main()
