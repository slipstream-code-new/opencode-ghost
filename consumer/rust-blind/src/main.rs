use serde::Deserialize;
use serde_json::{Value, json};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Deserialize)]
struct RuntimeExpect {
    payload: Value,
}

#[derive(Deserialize)]
struct RuntimeCase {
    case_id: String,
    expect: RuntimeExpect,
}

#[derive(Deserialize)]
struct TuiExpect {
    payload: Value,
}

#[derive(Deserialize)]
struct TuiCase {
    case_id: String,
    expect: TuiExpect,
}

#[derive(Deserialize)]
struct Commute {
    case_id: String,
    actual: Value,
    status: String,
}

fn load<T: for<'de> Deserialize<'de>>(root: &Path, path: &str) -> Result<T, String> {
    let body = fs::read_to_string(root.join(path)).map_err(|err| format!("{path}: {err}"))?;
    serde_json::from_str(&body).map_err(|err| format!("{path}: {err}"))
}

fn list(root: &Path, dir: &str) -> Result<Vec<PathBuf>, String> {
    let mut out: Vec<_> = fs::read_dir(root.join(dir))
        .map_err(|err| format!("{dir}: {err}"))?
        .filter_map(|item| item.ok().map(|x| x.path()))
        .filter(|path| path.extension().and_then(|x| x.to_str()) == Some("json"))
        .collect();
    out.sort();
    Ok(out)
}

fn rel(root: &Path, path: &PathBuf) -> String {
    path.strip_prefix(root).unwrap().to_string_lossy().to_string()
}

fn slug(id: &str, n: usize) -> String {
    let parts: Vec<_> = id.split('.').collect();
    if n == 0 {
        return parts.get(2..).unwrap_or(&parts).join("_");
    }
    parts[parts.len().saturating_sub(n)..].join("_")
}

fn runtime(root: &Path) -> Result<(), String> {
    for path in list(root, "contracts/runtime/cases")? {
        let case: RuntimeCase = load(root, &rel(root, &path))?;
        let evidence: Commute = load(root, &format!("evidence/traceability/commuting.runtime.{}.json", slug(&case.case_id, 1)))?;
        if case.case_id != evidence.case_id || evidence.status != "pass" || case.expect.payload != evidence.actual {
            return Err(format!("runtime blind mismatch: {}", case.case_id));
        }
    }
    Ok(())
}

fn tui(root: &Path) -> Result<(), String> {
    for path in list(root, "contracts/tui/cases")? {
        let case: TuiCase = load(root, &rel(root, &path))?;
        let evidence: Commute = load(root, &format!("evidence/traceability/commuting.tui.{}.json", slug(&case.case_id, 0)))?;
        let mut layers = case
            .expect
            .payload
            .get("layers")
            .and_then(|x| x.as_array())
            .cloned()
            .unwrap_or_default();
        layers.sort_by_key(|x| x.as_str().unwrap_or_default().to_string());
        let expected = json!({
            "screens": case.expect.payload.get("screens").cloned().unwrap_or(Value::Null),
            "layers": layers,
            "matrix": case.expect.payload.get("matrix").cloned().unwrap_or(Value::Null),
        });
        if case.case_id != evidence.case_id || evidence.status != "pass" || expected != evidence.actual {
            return Err(format!("tui blind mismatch: {}", case.case_id));
        }
    }
    Ok(())
}

fn main() {
    let Some(root) = std::env::args().nth(1) else {
        eprintln!("usage: cargo run -- <isolated-ghost-root>");
        std::process::exit(1);
    };
    let root = PathBuf::from(root);
    if let Err(err) = runtime(&root).and_then(|_| tui(&root)) {
        eprintln!("{err}");
        std::process::exit(1);
    }
}
