#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"
const target = "evidence/traceability/commuting.integrations.providers.json"

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T

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

const render = async () => {
  const providers = await readJson<Providers>("contracts/integrations/inventory/providers.json")
  const integrationCase = await readJson<Case>("contracts/integrations/cases/canonical.providers.json")
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
  return `${JSON.stringify(payload, null, 2)}\n`
}

const main = async () => {
  const want = await render()
  if (mode === "write") {
    await Bun.write(join(root, target), want)
    return
  }
  const got = await Bun.file(join(root, target)).text()
  if (got === want) return
  throw new Error(`stale integrations commuting evidence: ${target}`)
}

await main()
