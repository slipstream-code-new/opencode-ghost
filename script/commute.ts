#!/usr/bin/env bun

import { join } from "node:path"

const root = join(import.meta.dir, "..")
const mode = process.argv.includes("--write") ? "write" : "check"

const readJson = async <T>(path: string) => (await Bun.file(join(root, path)).json()) as T
const readText = async (path: string) => Bun.file(join(root, path)).text()

type Case = {
  case_id: string
  profile_id: string
  world_id: string
  input: {
    kind: string
    steps: string[]
  }
  expect: {
    kind: string
    surface: string
    observation_space: {
      projection: string
      equivalence: string
      normalization: string
    }
    payload: {
      created: boolean
      phase: string
      permission: string
      events: number
    }
  }
  required_routes: string[]
}

type Witness = {
  case_id: string
  profile_id: string
  world_id: string
  steps: string[]
}

type Kernel = {
  transition_classes: string[]
}

type Routes = {
  items: {
    stable_id: string
    operation_id: string
    source: string
  }[]
}

type State = {
  created: boolean
  phase: "idle" | "busy" | "waiting"
  permission: "clear" | "pending" | "approved" | "rejected"
  events: number
}

const fold = (steps: string[]) =>
  steps.reduce<State>(
    (s, step) => {
      if (step === "session_create") {
        if (s.created) throw new Error("duplicate session_create")
        return { ...s, created: true, events: s.events + 1 }
      }
      if (step === "session_busy") {
        if (!s.created || s.phase !== "idle" || s.permission !== "clear") {
          throw new Error("session_busy violates kernel preconditions")
        }
        return { ...s, phase: "busy", events: s.events + 1 }
      }
      if (step === "assistant_output") {
        if (s.phase !== "busy") throw new Error("assistant_output requires busy phase")
        return { ...s, events: s.events + 1 }
      }
      if (step === "permission_request") {
        if (s.phase !== "busy" || s.permission !== "clear") {
          throw new Error("permission_request violates kernel preconditions")
        }
        return { ...s, phase: "waiting", permission: "pending", events: s.events + 1 }
      }
      if (step === "permission_reply") {
        if (s.phase !== "waiting" || s.permission !== "pending") {
          throw new Error("permission_reply violates kernel preconditions")
        }
        return { ...s, phase: "idle", permission: "approved", events: s.events + 1 }
      }
      if (step === "session_idle") {
        if (s.phase !== "idle" || s.permission !== "approved") {
          throw new Error("session_idle requires approved idle state")
        }
        return { ...s, events: s.events + 1 }
      }
      throw new Error(`unknown witness step: ${step}`)
    },
    {
      created: false,
      phase: "idle",
      permission: "clear",
      events: 0,
    },
  )

const target = "evidence/traceability/commuting.runtime.permission_cycle.json"

const render = async () => {
  const kernel = await readJson<Kernel>("model/runtime/kernel.json")
  const witness = await readJson<Witness>("tests/runtime/witness.json")
  const runtimeCase = await readJson<Case>("contracts/runtime/cases/witness.permission_cycle.json")
  const routes = await readJson<Routes>("contracts/runtime/inventory/routes.json")
  const quint = await readText("spec/runtime_witness.qnt")
  const lean = await readText("OpencodeGhost/RuntimeWitness.lean")
  const actual = fold(runtimeCase.input.steps)
  const missingRoutes = runtimeCase.required_routes.filter(
    (id) => !routes.items.some((route) => route.operation_id === id),
  )
  const missingTransitions = ["session_create", "permission_request", "permission_reply"].filter(
    (id) => !kernel.transition_classes.includes(id),
  )
  const formalMarkers = {
    quint_permission_cycle: quint.includes("run permission_cycle"),
    quint_approved_idle: quint.includes("approved_means_idle"),
    lean_witness_final: lean.includes("witness_replay_final"),
    lean_coherent_replay: lean.includes("coherent_replay"),
  }
  const payload = {
    case_id: runtimeCase.case_id,
    profile_id: runtimeCase.profile_id,
    world_id: runtimeCase.world_id,
    observation_space: runtimeCase.expect.observation_space,
    checks: {
      witness_matches_case: witness.case_id === runtimeCase.case_id && witness.steps.join("\n") === runtimeCase.input.steps.join("\n"),
      routes_present: missingRoutes.length === 0,
      transitions_present: missingTransitions.length === 0,
      formal_markers: formalMarkers,
      projection_matches_expectation:
        JSON.stringify(actual) === JSON.stringify(runtimeCase.expect.payload),
    },
    actual,
    expect: runtimeCase.expect.payload,
    missing_routes: missingRoutes,
    missing_transitions: missingTransitions,
    status:
      missingRoutes.length === 0 &&
      missingTransitions.length === 0 &&
      Object.values(formalMarkers).every(Boolean) &&
      JSON.stringify(actual) === JSON.stringify(runtimeCase.expect.payload) &&
      witness.case_id === runtimeCase.case_id &&
      witness.steps.join("\n") === runtimeCase.input.steps.join("\n")
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
  throw new Error(`stale commuting evidence: ${target}`)
}

await main()
