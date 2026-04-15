#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"
const target = "evidence/traceability/commuting.security.permission_gating.json"

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T

type Routes = {
  items: {
    operation_id: string
  }[]
}

type SecurityCase = {
  case_id: string
  profile_id: string
  expect: {
    observation_space: Record<string, unknown>
    payload: {
      required_routes: string[]
      required_claims: string[]
    }
  }
}

type GraphRow = {
  kind: "node" | "edge"
  id: string
}

const render = async () => {
  const routes = await readJson<Routes>("contracts/runtime/inventory/routes.json")
  const securityCase = await readJson<SecurityCase>("contracts/security/cases/permission.gating.json")
  const runtime = await readJson<{ status: string }>("evidence/traceability/commuting.runtime.permission_cycle.json")
  const claims = (await Bun.file(join(root, "graph/contract-graph.jsonl")).text())
    .split("\n")
    .filter(Boolean)
    .map((x) => JSON.parse(x) as GraphRow)
    .filter((x) => x.kind === "node")
    .map((x) => x.id)
  const missingRoutes = securityCase.expect.payload.required_routes.filter(
    (x) => !routes.items.some((route) => route.operation_id === x),
  )
  const missingClaims = securityCase.expect.payload.required_claims.filter(
    (x) => !claims.includes(x),
  )
  const payload = {
    case_id: securityCase.case_id,
    profile_id: securityCase.profile_id,
    observation_space: securityCase.expect.observation_space,
    actual: {
      required_routes: securityCase.expect.payload.required_routes,
      required_claims: securityCase.expect.payload.required_claims,
      runtime_permission_cycle_status: runtime.status,
    },
    missing_routes: missingRoutes,
    missing_claims: missingClaims,
    status:
      missingRoutes.length === 0 &&
      missingClaims.length === 0 &&
      runtime.status === "pass"
        ? "pass"
        : "fail",
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
  throw new Error(`stale security commuting evidence: ${target}`)
}

await main()
