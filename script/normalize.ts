#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T

const sort = (xs: string[]) => [...xs].sort()

const runtimeNormalize = (x: Record<string, unknown>) => ({
  created: x.created === true,
  phase: `${x.phase ?? ""}`,
  permission: `${x.permission ?? ""}`,
  events: Number(x.events ?? 0),
})

const tuiNormalize = (x: Record<string, any>) => ({
  screens: (x.screens ?? []).map((y: unknown) => `${y}`),
  layers: sort((x.layers ?? []).map((y: unknown) => `${y}`)),
  matrix: {
    sizes: sort((x.matrix?.sizes ?? []).map((y: unknown) => `${y}`)),
    theme: typeof x.matrix?.theme === "string" ? x.matrix.theme : `${x.matrix?.theme?.token ?? ""}`,
    modes: sort((x.matrix?.modes ?? []).map((y: unknown) => `${y}`)),
    platform: `${x.matrix?.platform ?? ""}`,
  },
})

type Eq = {
  left: Record<string, unknown>
  right: Record<string, unknown>
  expect_equal: boolean
}

type Case = {
  id: string
  input?: Record<string, unknown>
  expected?: Record<string, unknown>
  left?: Record<string, unknown>
  right?: Record<string, unknown>
  expect_equal?: boolean
}

const law = (name: string, ok: boolean) => {
  if (!ok) throw new Error(`normalization law failed: ${name}`)
}

const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const runSet = (name: string, cases: Case[], normalize: (x: Record<string, unknown>) => Record<string, unknown>) => {
  for (const c of cases) {
    if (c.input && c.expected) {
      const once = normalize(c.input)
      const twice = normalize(once)
      law(`${name}.${c.id}.determinism`, eq(once, normalize(c.input)))
      law(`${name}.${c.id}.idempotence`, eq(once, twice))
      law(`${name}.${c.id}.expectation`, eq(once, c.expected))
      law(
        `${name}.${c.id}.monotonic_erasure`,
        Object.keys(once).every((k) => k in c.input!),
      )
    }
    if (c.left && c.right && typeof c.expect_equal === "boolean") {
      const left = normalize(c.left)
      const right = normalize(c.right)
      law(`${name}.${c.id}.semantic_preservation`, eq(left, right) === c.expect_equal)
    }
  }
}

const main = async () => {
  const runtime = await readJson<{ cases: Case[] }>("tests/normalization/runtime.json")
  const tui = await readJson<{ cases: Case[] }>("tests/normalization/tui.json")
  runSet("runtime", runtime.cases, runtimeNormalize)
  runSet("tui", tui.cases, tuiNormalize)
  console.log("normalization laws hold")
}

await main()
