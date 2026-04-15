#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T
const readJsonl = async <T>(path: string) =>
  (await Bun.file(join(root, path)).text())
    .split("\n")
    .filter(Boolean)
    .map((x) => JSON.parse(x) as T)
const list = async (glob: string) => {
  const out: string[] = []
  for await (const path of new Bun.Glob(glob).scan({ cwd: root })) out.push(path)
  return out.sort()
}

type Row = {
  kind: string
  case_id?: string
  profile_id?: string
  observation_kind?: string
  status?: string
}

const groups = [
  {
    id: "core_runtime",
    profile: "core-runtime",
    glob: "evidence/traceability/opencode_source.core_runtime.*.jsonl",
  },
  {
    id: "runtime_formal",
    profile: "runtime-formal",
    glob: "evidence/traceability/opencode_source.runtime_formal.*.jsonl",
  },
  {
    id: "tui_certified",
    profile: "tui-certified",
    glob: "evidence/traceability/opencode_source.tui_certified.*.jsonl",
  },
  {
    id: "integrations_canonical",
    profile: "integrations-canonical",
    glob: "evidence/traceability/opencode_source.integrations_canonical.*.jsonl",
  },
  {
    id: "security_critical",
    profile: "security-critical",
    glob: "evidence/traceability/opencode_source.security_critical.*.jsonl",
  },
]

const render = async (id: string, profile: string, paths: string[]) => {
  const baseline = await readJson<{ source_commit: string }>("evidence/traceability/baseline.json")
  const rows = await Promise.all(paths.map((path) => readJsonl<Row>(path)))
  const flat = rows.flat()
  const status = flat.filter((x) => x.kind === "verdict").every((x) => x.status === "pass") ? "pass" : "fail"
  if (flat.some((x) => x.kind === "hello") === false) throw new Error(`missing hello envelope for ${profile}`)
  if (flat.some((x) => x.kind === "verdict") === false) throw new Error(`missing verdict envelope for ${profile}`)
  return [
    `evidence/traceability/opencode_source.profile.${id}.json`,
    JSON.stringify(
      {
        schema_version: "0.1.0",
        artifact_family: "evidence.profile.certification",
        implementation_id: "opencode-source",
        profile_id: profile,
        source_commit: baseline.source_commit,
        status,
        case_ids: [...new Set(flat.flatMap((x) => (x.case_id ? [x.case_id] : [])))],
        observation_kinds: [...new Set(flat.flatMap((x) => (x.observation_kind ? [x.observation_kind] : [])))],
        transcript_paths: paths,
      },
      null,
      2,
    ) + "\n",
  ] as const
}

const renderFull = async () => {
  const baseline = await readJson<{ source_commit: string }>("evidence/traceability/baseline.json")
  const paths = groups.map((x) => `evidence/traceability/opencode_source.profile.${x.id}.json`)
  const items = await Promise.all(
    paths.map((path) =>
      readJson<{ status: string; case_ids: string[]; observation_kinds: string[]; profile_id: string }>(path),
    ),
  )
  return [
    "evidence/traceability/opencode_source.profile.full_reference.json",
    JSON.stringify(
      {
        schema_version: "0.1.0",
        artifact_family: "evidence.profile.certification",
        implementation_id: "opencode-source",
        profile_id: "full-reference",
        source_commit: baseline.source_commit,
        status: items.every((x) => x.status === "pass") ? "pass" : "fail",
        case_ids: [...new Set(items.flatMap((x) => x.case_ids))],
        observation_kinds: [...new Set(items.flatMap((x) => x.observation_kinds))],
        transcript_paths: paths,
        included_profiles: items.map((x) => x.profile_id),
      },
      null,
      2,
    ) + "\n",
  ] as const
}

const main = async () => {
  let bad = false
  for (const item of groups) {
    const paths = await list(item.glob)
    const [target, want] = await render(item.id, item.profile, paths)
    if (mode === "write") {
      await Bun.write(join(root, target), want)
      continue
    }
    const got = await Bun.file(join(root, target)).text()
    if (got === want) continue
    console.error(`stale profile certification summary: ${target}`)
    bad = true
  }
  const [target, want] = await renderFull()
  if (mode === "write") {
    await Bun.write(join(root, target), want)
  } else {
    const got = await Bun.file(join(root, target)).text()
    if (got !== want) {
      console.error(`stale profile certification summary: ${target}`)
      bad = true
    }
  }
  if (bad) process.exit(1)
}

await main()
