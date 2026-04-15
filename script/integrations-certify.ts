#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"
const target = "evidence/traceability/opencode_source.integrations_canonical.providers.jsonl"

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T

const render = async () => {
  const baseline = await readJson<{ source_commit: string }>("evidence/traceability/baseline.json")
  const integrationCase = await readJson<{ case_id: string; profile_id: string }>(
    "contracts/integrations/cases/canonical.providers.json",
  )
  const commuting = await readJson<{ status: string; actual: Record<string, unknown> }>(
    "evidence/traceability/commuting.integrations.providers.json",
  )
  const rows = [
    { kind: "hello", protocol_version: "0.1.0", implementation_id: "opencode-source", implementation_version: baseline.source_commit },
    { kind: "capabilities", supported_profiles: ["integrations-canonical"], supported_transports: ["file_path"], supported_observations: ["provider_inventory"] },
    { kind: "profile_request", profile_id: integrationCase.profile_id },
    { kind: "profile_response", profile_id: integrationCase.profile_id, accepted: true },
    { kind: "case_offer", case_id: integrationCase.case_id, profile_id: integrationCase.profile_id, schema_family: "contract.integrations.case", payload: { path: "contracts/integrations/cases/canonical.providers.json" } },
    { kind: "case_accept", case_id: integrationCase.case_id, accepted: true },
    { kind: "checkpoint", case_id: integrationCase.case_id, seq: 1, observation_kind: "provider_inventory", payload: commuting.actual },
    { kind: "verdict", case_id: integrationCase.case_id, status: commuting.status, evidence: "evidence/traceability/commuting.integrations.providers.json" },
  ]
  if (rows.at(-1)?.status !== "pass") throw new Error("integration certification did not pass")
  return `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`
}

const main = async () => {
  const want = await render()
  if (mode === "write") {
    await Bun.write(join(root, target), want)
    return
  }
  const got = await Bun.file(join(root, target)).text()
  if (got === want) return
  throw new Error(`stale integrations certification transcript: ${target}`)
}

await main()
