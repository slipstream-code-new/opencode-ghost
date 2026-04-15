#!/usr/bin/env bun

import { existsSync } from "node:fs"
import { join, relative } from "node:path"

const root = join(import.meta.dir, "..")

const list = async (glob: string) => {
  const out: string[] = []
  for await (const path of new Bun.Glob(glob).scan({ cwd: root, absolute: true })) out.push(path)
  return out.sort()
}

const read = async (path: string) => Bun.file(path).text()
const rel = (path: string) => relative(root, path)

const checkJson = async () => {
  const files = await list("{contracts,evidence,graph,model,tests}/**/*.json")
  for (const path of files) JSON.parse(await read(path))
  return files
}

const checkJsonl = async () => {
  const files = await list("{graph,evidence}/**/*.jsonl")
  for (const path of files) {
    const body = await read(path)
    const rows = body.split("\n").filter(Boolean)
    for (const [i, row] of rows.entries()) {
      try {
        JSON.parse(row)
      } catch {
        throw new Error(`invalid jsonl row ${i + 1}: ${rel(path)}`)
      }
    }
  }
  return files
}

const checkGraph = async () => {
  const path = join(root, "graph/contract-graph.jsonl")
  const rows = (await read(path))
    .split("\n")
    .filter(Boolean)
    .map((x) => JSON.parse(x))
  const ids = new Set<string>()
  const nodes = new Set<string>()
  for (const row of rows) {
    if (ids.has(row.id)) throw new Error(`duplicate graph id: ${row.id}`)
    ids.add(row.id)
    if (row.kind === "node") nodes.add(row.id)
  }
  for (const row of rows) {
    if (row.kind === "node" && typeof row.path === "string") {
      if (!existsSync(join(root, row.path))) throw new Error(`missing graph path: ${row.id} -> ${row.path}`)
    }
    if (row.kind !== "edge") continue
    if (!ids.has(row.from)) throw new Error(`missing edge source: ${row.id} -> ${row.from}`)
    if (!ids.has(row.to)) throw new Error(`missing edge target: ${row.id} -> ${row.to}`)
  }
  return rows.length
}

const main = async () => {
  const json = await checkJson()
  const jsonl = await checkJsonl()
  const rows = await checkGraph()
  console.log(`validated json: ${json.length}`)
  console.log(`validated jsonl: ${jsonl.length}`)
  console.log(`validated graph rows: ${rows}`)
}

await main()
