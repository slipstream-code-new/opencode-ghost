use serde::Deserialize;
use serde_json::{Value, json};
use std::fs;
use std::path::PathBuf;

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

fn root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
}

fn load<T: for<'de> Deserialize<'de>>(path: &str) -> Result<T, String> {
    let body = fs::read_to_string(root().join(path)).map_err(|err| format!("{path}: {err}"))?;
    serde_json::from_str(&body).map_err(|err| format!("{path}: {err}"))
}

fn list(dir: &str) -> Result<Vec<PathBuf>, String> {
    let mut out: Vec<_> = fs::read_dir(root().join(dir))
        .map_err(|err| format!("{dir}: {err}"))?
        .filter_map(|item| item.ok().map(|x| x.path()))
        .filter(|path| path.extension().and_then(|x| x.to_str()) == Some("json"))
        .collect();
    out.sort();
    Ok(out)
}

fn rel(path: &PathBuf) -> String {
    path.strip_prefix(root())
        .unwrap()
        .to_string_lossy()
        .to_string()
}

fn slug(id: &str, n: usize) -> String {
    let parts: Vec<_> = id.split('.').collect();
    if n == 0 {
        return parts.get(2..).unwrap_or(&parts).join("_");
    }
    parts[parts.len().saturating_sub(n)..].join("_")
}

fn runtime() -> Result<(), String> {
    for path in list("contracts/runtime/cases")? {
        let case: RuntimeCase = load(&rel(&path))?;
        let evidence: Commute = load(&format!("evidence/traceability/commuting.runtime.{}.json", slug(&case.case_id, 1)))?;
        if case.case_id != evidence.case_id {
            return Err("runtime case/evidence id mismatch".into());
        }
        if evidence.status != "pass" {
            return Err("runtime commuting evidence is not passing".into());
        }
        if case.expect.payload != evidence.actual {
            return Err("runtime case expectation does not match Rust-parsed evidence".into());
        }
        println!("{}", serde_json::to_string_pretty(&evidence.actual).unwrap());
    }
    Ok(())
}

fn tui() -> Result<(), String> {
    for path in list("contracts/tui/cases")? {
        let case: TuiCase = load(&rel(&path))?;
        let evidence: Commute = load(&format!("evidence/traceability/commuting.tui.{}.json", slug(&case.case_id, 0)))?;
        if case.case_id != evidence.case_id {
            return Err("tui case/evidence id mismatch".into());
        }
        if evidence.status != "pass" {
            return Err("tui commuting evidence is not passing".into());
        }
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
        if expected != evidence.actual {
            return Err("tui case expectation does not match Rust-parsed evidence".into());
        }
        println!("{}", serde_json::to_string_pretty(&evidence.actual).unwrap());
    }
    Ok(())
}

fn main() {
    let mode = std::env::args().nth(1).unwrap_or_default();
    let out = match mode.as_str() {
        "runtime" => runtime(),
        "tui" => tui(),
        _ => Err("usage: cargo run -- [runtime|tui]".into()),
    };
    if let Err(err) = out {
        eprintln!("{err}");
        std::process::exit(1);
    }
}
