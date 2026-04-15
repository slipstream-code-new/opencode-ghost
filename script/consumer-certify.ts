#!/usr/bin/env bun

import { cpSync, mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T
const list = async (glob: string) => {
  const out: string[] = []
  for await (const path of new Bun.Glob(glob).scan({ cwd: root })) out.push(path)
  return out.sort()
}

const run = async (cmd: string[], cwd = root) => {
  const proc = Bun.spawn(cmd, { cwd, stdout: "pipe", stderr: "pipe" })
  const code = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  if (code === 0) return { stdout, stderr }
  throw new Error(`${cmd.join(" ")} failed\n${stdout}\n${stderr}`)
}

const renderRustRef = async () => {
  await run(["cargo", "run", "--quiet", "--manifest-path", "consumer/rust-ref/Cargo.toml", "--", "runtime"])
  await run(["cargo", "run", "--quiet", "--manifest-path", "consumer/rust-ref/Cargo.toml", "--", "tui"])
  return {
    schema_version: "0.1.0",
    artifact_family: "evidence.consumer.certification",
    implementation_id: "rust-reference",
    status: "pass",
    profiles: ["core-runtime", "runtime-formal", "tui-certified"],
    runtime_cases: (await list("contracts/runtime/cases/*.json")).length,
    tui_cases: (await list("contracts/tui/cases/*.json")).length,
  }
}

const renderRustBlind = async () => {
  const dir = mkdtempSync(join(tmpdir(), "opencode-ghost-"))
  try {
    mkdirSync(join(dir, "contracts/runtime/cases"), { recursive: true })
    mkdirSync(join(dir, "contracts/tui/cases"), { recursive: true })
    mkdirSync(join(dir, "evidence/traceability"), { recursive: true })
    for (const path of await list("contracts/runtime/cases/*.json")) cpSync(join(root, path), join(dir, path))
    for (const path of await list("contracts/tui/cases/*.json")) cpSync(join(root, path), join(dir, path))
    for (const path of await list("evidence/traceability/commuting.runtime.*.json")) cpSync(join(root, path), join(dir, path))
    for (const path of await list("evidence/traceability/commuting.tui.*.json")) cpSync(join(root, path), join(dir, path))
    await run(["cargo", "run", "--quiet", "--manifest-path", "consumer/rust-blind/Cargo.toml", "--", dir])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  return {
    schema_version: "0.1.0",
    artifact_family: "evidence.consumer.certification",
    implementation_id: "rust-blind",
    status: "pass",
    profiles: ["core-runtime", "runtime-formal", "tui-certified"],
    runtime_cases: (await list("contracts/runtime/cases/*.json")).length,
    tui_cases: (await list("contracts/tui/cases/*.json")).length,
  }
}

const renderGo = async () => {
  const out = await run(["go", "run", "."], join(root, "consumer/go-sanity"))
  const lines = out.stdout.split("\n").filter(Boolean)
  return {
    schema_version: "0.1.0",
    artifact_family: "evidence.consumer.certification",
    implementation_id: "go-sanity",
    status: "pass",
    profiles: ["core-runtime", "runtime-formal", "tui-certified"],
    runtime_cases: lines.filter((x) => x.startsWith("runtime=")).length,
    tui_cases: lines.filter((x) => x.startsWith("tui=")).length,
  }
}

const targets = async () =>
  [
    ["evidence/traceability/consumer.rust_reference.json", JSON.stringify(await renderRustRef(), null, 2) + "\n"],
    ["evidence/traceability/consumer.rust_blind.json", JSON.stringify(await renderRustBlind(), null, 2) + "\n"],
    ["evidence/traceability/consumer.go_sanity.json", JSON.stringify(await renderGo(), null, 2) + "\n"],
  ] as const

const main = async () => {
  let bad = false
  for (const [target, want] of await targets()) {
    if (mode === "write") {
      await Bun.write(join(root, target), want)
      continue
    }
    const got = await Bun.file(join(root, target)).text()
    if (got === want) continue
    console.error(`stale consumer certification summary: ${target}`)
    bad = true
  }
  if (bad) process.exit(1)
}

await main()
