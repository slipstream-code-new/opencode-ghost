#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T
const list = async (glob: string) => {
  const out: string[] = []
  for await (const path of new Bun.Glob(glob).scan({ cwd: root })) out.push(path)
  return out.sort()
}
const slug = (id: string) => id.split(".").slice(2).join("_")

type Witness = {
  case_id: string
  profile_id: string
  surfaces: string[]
  layers: string[]
  required_tui_routes: string[]
  required_tests: string[]
}

type TuiCase = {
  case_id: string
  profile_id: string
  input: {
    surfaces: string[]
    layers: string[]
  }
  expect: {
    observation_space: {
      projection: string
      equivalence: string
      normalization: string
    }
    payload: {
      screens: string[]
      layers: string[]
      matrix: {
        sizes: string[]
        theme: string
        modes: string[]
        platform: string
      }
    }
  }
  required_surfaces: string[]
  required_tests: string[]
}

type Certified = {
  matrix: {
    sizes: string[]
    theme: string
    modes: string[]
    platform: string
  }
  screens: {
    id: string
    layers: string[]
  }[]
}

type Inventory = {
  items: {
    id: string
  }[]
}

const render = async (path: string) => {
  const tuiCase = await readJson<TuiCase>(path)
  const witness = await readJson<Witness>(`tests/tui/${slug(tuiCase.case_id)}.json`)
  const certified = await readJson<Certified>("contracts/tui/certified.json")
  const surfaces = await readJson<Inventory>("contracts/tui/inventory/surfaces.json")
  const tests = await readJson<Inventory>("contracts/tui/inventory/tests.json")
  const matched = certified.screens.filter((screen) => tuiCase.expect.payload.screens.includes(screen.id))
  const actual = {
    screens: matched.map((screen) => screen.id),
    layers: [...new Set(matched.flatMap((screen) => screen.layers))].sort(),
    matrix: certified.matrix,
  }
  const missingSurfaces = tuiCase.required_surfaces.filter(
    (id) => !surfaces.items.some((item) => item.id === id),
  )
  const missingTests = tuiCase.required_tests.filter(
    (id) => !tests.items.some((item) => item.id === id),
  )
  const payload = {
    case_id: tuiCase.case_id,
    profile_id: tuiCase.profile_id,
    observation_space: tuiCase.expect.observation_space,
    checks: {
      witness_matches_case:
        witness.case_id === tuiCase.case_id &&
        witness.profile_id === tuiCase.profile_id &&
        witness.surfaces.join("\n") === tuiCase.input.surfaces.join("\n") &&
        witness.layers.join("\n") === tuiCase.input.layers.join("\n"),
      surfaces_present: missingSurfaces.length === 0,
      tests_present: missingTests.length === 0,
      projection_matches_expectation:
        JSON.stringify(actual) === JSON.stringify({
          screens: tuiCase.expect.payload.screens,
          layers: [...tuiCase.expect.payload.layers].sort(),
          matrix: tuiCase.expect.payload.matrix,
        }),
    },
    actual,
    expect: {
      screens: tuiCase.expect.payload.screens,
      layers: [...tuiCase.expect.payload.layers].sort(),
      matrix: tuiCase.expect.payload.matrix,
    },
    missing_surfaces: missingSurfaces,
    missing_tests: missingTests,
    status:
      missingSurfaces.length === 0 &&
      missingTests.length === 0 &&
      witness.case_id === tuiCase.case_id &&
      witness.profile_id === tuiCase.profile_id &&
      witness.surfaces.join("\n") === tuiCase.input.surfaces.join("\n") &&
      witness.layers.join("\n") === tuiCase.input.layers.join("\n") &&
      JSON.stringify(actual) ===
        JSON.stringify({
          screens: tuiCase.expect.payload.screens,
          layers: [...tuiCase.expect.payload.layers].sort(),
          matrix: tuiCase.expect.payload.matrix,
        })
        ? "pass"
        : "fail",
  }
  return [slug(tuiCase.case_id), `${JSON.stringify(payload, null, 2)}\n`] as const
}

const main = async () => {
  const cases = await list("contracts/tui/cases/*.json")
  let bad = false
  for (const path of cases) {
    const [name, want] = await render(path)
    const target = `evidence/traceability/commuting.tui.${name}.json`
    if (mode === "write") {
      await Bun.write(join(root, target), want)
      continue
    }
    const got = await Bun.file(join(root, target)).text()
    if (got === want) continue
    console.error(`stale TUI commuting evidence: ${target}`)
    bad = true
  }
  if (bad) process.exit(1)
}

await main()
