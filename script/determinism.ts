#!/usr/bin/env bun

import { createHash } from "node:crypto"
import { join } from "node:path"

const root = join(import.meta.dir, "..")

const files = [
  "contracts/runtime/inventory/routes.json",
  "contracts/runtime/inventory/commands.json",
  "contracts/integrations/inventory/providers.json",
  "contracts/tui/inventory/surfaces.json",
  "contracts/tui/inventory/tests.json",
  "evidence/traceability/files.jsonl",
  "claims-ledger.md",
  "formalization-inventory.md",
  "completeness-matrix.md",
  "refinement-ledger.md",
  "rust-ergonomics-report.md",
  "semantic-coverage-report.md",
  "tcb-inventory.md",
  "evidence/traceability/commuting.runtime.permission_cycle.json",
  "evidence/traceability/commuting.tui.permission_view.json",
  "evidence/traceability/commuting.integrations.providers.json",
  "evidence/traceability/commuting.security.permission_gating.json",
  "evidence/traceability/opencode_source.runtime_formal.permission_cycle.jsonl",
  "evidence/traceability/opencode_source.tui_certified.permission_view.jsonl",
  "evidence/traceability/opencode_source.integrations_canonical.providers.jsonl",
  "evidence/traceability/opencode_source.security_critical.permission_gating.jsonl",
]

const hash = async (path: string) =>
  createHash("sha256").update(Buffer.from(await Bun.file(join(root, path)).arrayBuffer())).digest("hex")

const snap = async () => {
  const out: Record<string, string> = {}
  for (const path of files) out[path] = await hash(path)
  return out
}

const run = async (cmd: string[]) => {
  const proc = Bun.spawn(cmd, { cwd: root, stdout: "ignore", stderr: "pipe" })
  const code = await proc.exited
  if (code === 0) return
  throw new Error(`determinism command failed: ${cmd.join(" ")}\n${await new Response(proc.stderr).text()}`)
}

const main = async () => {
  const before = await snap()
  await run(["bun", "script/extract.ts", "--write"])
  await run(["bun", "script/render.ts", "--write"])
  await run(["bun", "script/commute.ts", "--write"])
  await run(["bun", "script/certify.ts", "--write"])
  await run(["bun", "script/tui-commute.ts", "--write"])
  await run(["bun", "script/tui-certify.ts", "--write"])
  await run(["bun", "script/integrations-commute.ts", "--write"])
  await run(["bun", "script/integrations-certify.ts", "--write"])
  await run(["bun", "script/security-commute.ts", "--write"])
  await run(["bun", "script/security-certify.ts", "--write"])
  const after = await snap()
  const changed = files.filter((path) => before[path] !== after[path])
  if (changed.length) throw new Error(`non-deterministic generated files: ${changed.join(", ")}`)
  console.log(`deterministic generated files: ${files.length}`)
}

await main()
