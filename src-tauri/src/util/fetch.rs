use crate::serializer::{Error, SerializedResult};
use serde::Serialize;
use std::fs;

// check limit
#[tauri::command]
pub fn fetch_file_count(
    path: &str,
    recursive: bool,
    max: usize,
    start: usize,
) -> SerializedResult<usize> {
    let mut count: usize = start;
    let dir = match fs::read_dir(path) {
        Ok(dir) => dir,
        Err(e) => return Err(Error::Io(e)),
    };
    for entry in dir {
        let entry = match entry {
            Ok(entry) => entry,
            Err(e) => return Err(Error::Io(e)),
        };
        let path = entry.path();
        if path.is_file() {
            count += 1;
            if count > max {
                return Err(Error::Text("MAX_LIMIT".to_string()));
            }
        } else if path.is_dir() {
            if recursive {
                match fetch_file_count(path.to_str().unwrap(), recursive, max - count, count) {
                    Ok(sub_count) => count = sub_count,
                    Err(e) => return Err(e),
                }
            }
        } else {
            return Err(Error::Io(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                "Target is not a File or Dir",
            )));
        }
    }
    Ok(count)
}

#[derive(Debug, Serialize)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub file_name: String,
    pub file_ext: String,
    pub size: usize,
}

// read file list
#[tauri::command]
pub fn fetch_file_list(path: &str, recursive: bool) -> SerializedResult<Vec<FileItem>> {
    let mut result: Vec<FileItem> = Vec::new();

    let dir = match fs::read_dir(path) {
        Ok(dir) => dir,
        Err(e) => return Err(Error::Io(e)),
    };

    for entry in dir {
        let entry = match entry {
            Ok(entry) => entry,
            Err(e) => return Err(Error::Io(e)),
        };
        let metadata = match entry.metadata() {
            Ok(metadata) => metadata,
            Err(e) => return Err(Error::Io(e)),
        };
        if metadata.is_dir() {
            if recursive {
                match fetch_file_list(entry.path().to_str().unwrap(), recursive) {
                    Ok(mut sub_result) => result.append(&mut sub_result),
                    Err(e) => return Err(e),
                }
            }
        } else if metadata.is_file() {
            let mux_path = entry.path();
            let name = entry.file_name().to_str().unwrap().to_string();
            let path = mux_path.to_str().unwrap().to_string();
            let file_name = mux_path.file_stem().unwrap().to_str().unwrap().to_string();
            let file_ext = mux_path.extension().unwrap().to_str().unwrap().to_string();
            let size = 0;
            result.push(FileItem {
                name,
                path,
                file_name,
                file_ext,
                size,
            });
        }
    }

    Ok(result)
}
