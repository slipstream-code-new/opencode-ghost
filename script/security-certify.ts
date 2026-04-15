#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"
const target = "evidence/traceability/opencode_source.security_critical.permission_gating.jsonl"

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T

const render = async () => {
  const baseline = await readJson<{ source_commit: string }>("evidence/traceability/baseline.json")
  const securityCase = await readJson<{ case_id: string; profile_id: string }>(
    "contracts/security/cases/permission.gating.json",
  )
  const commuting = await readJson<{ status: string; actual: Record<string, unknown> }>(
    "evidence/traceability/commuting.security.permission_gating.json",
  )
  const rows = [
    { kind: "hello", protocol_version: "0.1.0", implementation_id: "opencode-source", implementation_version: baseline.source_commit },
    { kind: "capabilities", supported_profiles: ["security-critical"], supported_transports: ["file_path"], supported_observations: ["permission_gate"] },
    { kind: "profile_request", profile_id: securityCase.profile_id },
    { kind: "profile_response", profile_id: securityCase.profile_id, accepted: true },
    { kind: "case_offer", case_id: securityCase.case_id, profile_id: securityCase.profile_id, schema_family: "contract.security.case", payload: { path: "contracts/security/cases/permission.gating.json" } },
    { kind: "case_accept", case_id: securityCase.case_id, accepted: true },
    { kind: "checkpoint", case_id: securityCase.case_id, seq: 1, observation_kind: "permission_gate", payload: commuting.actual },
    { kind: "verdict", case_id: securityCase.case_id, status: commuting.status, evidence: "evidence/traceability/commuting.security.permission_gating.json" },
  ]
  if (rows.at(-1)?.status !== "pass") throw new Error("security certification did not pass")
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
  throw new Error(`stale security certification transcript: ${target}`)
}

await main()
