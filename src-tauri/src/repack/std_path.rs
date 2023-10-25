// Re-export the fs module from the `tauri` crate.
use std::path;
// use crate::serializer::{Error, SerializedResult};

// is dir
#[tauri::command]
pub fn path_is_dir(path: &str) -> bool {
    path::Path::new(path).is_dir()
}