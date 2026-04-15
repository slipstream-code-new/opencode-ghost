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

type Providers = {
  dependencies: string[]
  files: string[]
}

type Case = {
  case_id: string
  profile_id: string
  expect: {
    observation_space: Record<string, unknown>
    payload: {
      required_dependencies: string[]
      required_files: string[]
    }
  }
}

const render = async (path: string) => {
  const providers = await readJson<Providers>("contracts/integrations/inventory/providers.json")
  const integrationCase = await readJson<Case>(path)
  const missingDependencies = integrationCase.expect.payload.required_dependencies.filter(
    (x) => !providers.dependencies.includes(x),
  )
  const missingFiles = integrationCase.expect.payload.required_files.filter(
    (x) => !providers.files.includes(x),
  )
  const payload = {
    case_id: integrationCase.case_id,
    profile_id: integrationCase.profile_id,
    observation_space: integrationCase.expect.observation_space,
    actual: {
      dependencies: integrationCase.expect.payload.required_dependencies,
      files: integrationCase.expect.payload.required_files,
    },
    missing_dependencies: missingDependencies,
    missing_files: missingFiles,
    status: missingDependencies.length === 0 && missingFiles.length === 0 ? "pass" : "fail",
  }
  return [slug(integrationCase.case_id), `${JSON.stringify(payload, null, 2)}\n`] as const
}

const main = async () => {
  const cases = await list("contracts/integrations/cases/*.json")
  let bad = false
  for (const path of cases) {
    const [name, want] = await render(path)
    const target = `evidence/traceability/commuting.integrations.${name}.json`
    if (mode === "write") {
      await Bun.write(join(root, target), want)
      continue
    }
    const got = await Bun.file(join(root, target)).text()
    if (got === want) continue
    console.error(`stale integrations commuting evidence: ${target}`)
    bad = true
  }
  if (bad) process.exit(1)
}

await main()
