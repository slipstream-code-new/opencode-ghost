#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"
const target = "evidence/traceability/opencode_source.runtime_formal.permission_cycle.jsonl"

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T

type Baseline = {
  source_commit: string
  required_runtime_routes: string[]
}

type Case = {
  case_id: string
  profile_id: string
}

type Commute = {
  case_id: string
  actual: Record<string, unknown>
  status: string
}

const render = async () => {
  const baseline = await readJson<Baseline>("evidence/traceability/baseline.json")
  const runtimeCase = await readJson<Case>("contracts/runtime/cases/witness.permission_cycle.json")
  const commuting = await readJson<Commute>("evidence/traceability/commuting.runtime.permission_cycle.json")
  const rows = [
    {
      kind: "hello",
      protocol_version: "0.1.0",
      implementation_id: "opencode-source",
      implementation_version: baseline.source_commit,
    },
    {
      kind: "capabilities",
      supported_profiles: ["core-runtime", "runtime-formal"],
      supported_transports: ["file_path"],
      supported_observations: ["state_projection"],
    },
    {
      kind: "profile_request",
      profile_id: runtimeCase.profile_id,
    },
    {
      kind: "profile_response",
      profile_id: runtimeCase.profile_id,
      accepted: true,
    },
    {
      kind: "case_offer",
      case_id: runtimeCase.case_id,
      profile_id: runtimeCase.profile_id,
      schema_family: "contract.runtime.case",
      payload: {
        path: "contracts/runtime/cases/witness.permission_cycle.json",
        required_runtime_routes: baseline.required_runtime_routes,
      },
    },
    {
      kind: "case_accept",
      case_id: runtimeCase.case_id,
      accepted: true,
    },
    {
      kind: "checkpoint",
      case_id: runtimeCase.case_id,
      seq: 1,
      observation_kind: "state_projection",
      payload: commuting.actual,
    },
    {
      kind: "verdict",
      case_id: runtimeCase.case_id,
      status: commuting.status,
      evidence: "evidence/traceability/commuting.runtime.permission_cycle.json",
    },
  ]
  const seq = rows
    .filter((row) => row.kind === "checkpoint")
    .map((row) => row.seq)
  if (seq.some((n, i) => n !== i + 1)) throw new Error("checkpoint ordering is not strictly increasing")
  if (rows[0].kind !== "hello") throw new Error("conformance transcript must start with hello")
  if (rows.at(-1)?.kind !== "verdict") throw new Error("conformance transcript must end with verdict")
  if (rows.at(-1)?.status !== "pass") throw new Error("baseline certification did not pass")
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
  throw new Error(`stale baseline certification transcript: ${target}`)
}

await main()
