// Re-export the fs module from the `tauri` crate.
use std::fs;
use std::path;
use crate::serializer::{Error, SerializedResult};

// copyFile
#[tauri::command]
pub fn fs_copy_file(source: &str, destination: &str) -> SerializedResult<u64> {
    match fs::copy(source, destination) {
        Ok(n) => Ok(n),
        Err(e) => Err(Error::Io(e)),
    }
}

// createDir

// exists
#[tauri::command]
pub fn fs_exists(path: &str) -> SerializedResult<bool> {
    match path::Path::new(path).try_exists() {
        Ok(b) => Ok(b),
        Err(e) => Err(Error::Io(e)),
    }
}

// readBinaryFile

// readDir

// readTextFile
#[tauri::command]
pub fn fs_read_text_file(path: &str) -> SerializedResult<String> {
    match fs::read_to_string(path) {
        Ok(s) => Ok(s),
        Err(e) => Err(Error::Io(e)),
    }
}

// removeDir

// removeFile
#[tauri::command]
pub fn fs_remove_file(path: &str) -> SerializedResult<()> {
    match fs::remove_file(path) {
        Ok(_) => Ok(()),
        Err(e) => Err(Error::Io(e)),
    }
}

// renameFile
#[tauri::command]
pub fn fs_rename_file(old_path: &str, new_path: &str) -> SerializedResult<()> {
    match fs::rename(old_path, new_path) {
        Ok(_) => Ok(()),
        Err(e) => Err(Error::Io(e)),
    }
}

// writeBinaryFile

// writeTextFile
#[tauri::command]
pub fn fs_write_text_file(path: &str, contents: &str) -> SerializedResult<()> {
    match fs::write(path, contents) {
        Ok(_) => Ok(()),
        Err(e) => Err(Error::Io(e)),
    }
}
