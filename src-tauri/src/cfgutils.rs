use std::path::Path;

#[tauri::command]
pub fn is_config_exist() -> bool {
    Path::new("config.json").exists()
}

use serde_json;
use std::fs;

#[tauri::command]
pub fn read_config() -> Result<serde_json::Value, String> {
    let config_str = fs::read_to_string("config.json").map_err(|e| e.to_string())?;
    serde_json::from_str(&config_str).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_config(config: serde_json::Value) -> Result<(), String> {
    let config_str = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write("config.json", config_str).map_err(|e| e.to_string())
}
