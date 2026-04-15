#!/usr/bin/env bun

import { createHash } from "node:crypto"
import { join } from "node:path"

const root = join(import.meta.dir, "..")
const list = async (glob: string) => {
  const out: string[] = []
  for await (const path of new Bun.Glob(glob).scan({ cwd: root })) out.push(path)
  return out.sort()
}

const hash = async (path: string) =>
  createHash("sha256").update(Buffer.from(await Bun.file(join(root, path)).arrayBuffer())).digest("hex")

const snap = async () => {
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
    ...(await list("evidence/traceability/commuting.runtime.*.json")),
    ...(await list("evidence/traceability/commuting.tui.*.json")),
    ...(await list("evidence/traceability/commuting.integrations.*.json")),
    ...(await list("evidence/traceability/commuting.security.*.json")),
    ...(await list("evidence/traceability/opencode_source.runtime_formal.*.jsonl")),
    ...(await list("evidence/traceability/opencode_source.tui_certified.*.jsonl")),
    ...(await list("evidence/traceability/opencode_source.integrations_canonical.*.jsonl")),
    ...(await list("evidence/traceability/opencode_source.security_critical.*.jsonl")),
    ...(await list("evidence/traceability/opencode_source.profile.*.json")),
    ...(await list("evidence/traceability/consumer.*.json")),
  ]
  const out: Record<string, string> = {}
  for (const path of files) out[path] = await hash(path)
  return { files, out }
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
  await run(["bun", "script/profile-certify.ts", "--write"])
  await run(["bun", "script/consumer-certify.ts", "--write"])
  const after = await snap()
  const files = [...new Set([...before.files, ...after.files])].sort()
  const changed = files.filter((path) => before.out[path] !== after.out[path])
  if (changed.length) throw new Error(`non-deterministic generated files: ${changed.join(", ")}`)
  console.log(`deterministic generated files: ${files.length}`)
}

await main()
