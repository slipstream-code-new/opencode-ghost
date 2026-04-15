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

const render = async (path: string) => {
  const baseline = await readJson<{ source_commit: string }>("evidence/traceability/baseline.json")
  const integrationCase = await readJson<{ case_id: string; profile_id: string; expect: { kind: string } }>(path)
  const name = slug(integrationCase.case_id)
  const commuting = await readJson<{ status: string; actual: Record<string, unknown> }>(
    `evidence/traceability/commuting.integrations.${name}.json`,
  )
  const rows = [
    { kind: "hello", protocol_version: "0.1.0", implementation_id: "opencode-source", implementation_version: baseline.source_commit },
    { kind: "capabilities", supported_profiles: ["integrations-canonical"], supported_transports: ["file_path"], supported_observations: ["provider_inventory"] },
    { kind: "profile_request", profile_id: integrationCase.profile_id },
    { kind: "profile_response", profile_id: integrationCase.profile_id, accepted: true },
    { kind: "case_offer", case_id: integrationCase.case_id, profile_id: integrationCase.profile_id, schema_family: "contract.integrations.case", payload: { path } },
    { kind: "case_accept", case_id: integrationCase.case_id, accepted: true },
    { kind: "checkpoint", case_id: integrationCase.case_id, seq: 1, observation_kind: integrationCase.expect.kind, payload: commuting.actual },
    { kind: "verdict", case_id: integrationCase.case_id, status: commuting.status, evidence: `evidence/traceability/commuting.integrations.${name}.json` },
  ]
  if (rows.at(-1)?.status !== "pass") throw new Error("integration certification did not pass")
  return [`evidence/traceability/opencode_source.integrations_canonical.${name}.jsonl`, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`] as const
}

const main = async () => {
  const cases = await list("contracts/integrations/cases/*.json")
  let bad = false
  for (const path of cases) {
    const [target, want] = await render(path)
    if (mode === "write") {
      await Bun.write(join(root, target), want)
      continue
    }
    const got = await Bun.file(join(root, target)).text()
    if (got === want) continue
    console.error(`stale integrations certification transcript: ${target}`)
    bad = true
  }
  if (bad) process.exit(1)
}

await main()
