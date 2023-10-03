use serde::Serialize;
use std::fs;
use std::fs::File;
use std::io::{Read, Write};

/**
 * File related functions
 */

// read file from given file path, and return file content as string
#[tauri::command]
pub fn read_file(file_path: &str) -> Result<String, String> {
    let mut file = match File::open(file_path) {
        Ok(file) => file,
        Err(e) => return Err(e.to_string()),
    };
    let mut contents = String::new();
    match file.read_to_string(&mut contents) {
        Ok(_) => Ok(contents),
        Err(e) => Err(e.to_string()),
    }
}

// write a string to a file with given file path
#[tauri::command]
pub fn write_file(file_path: &str, content: &str) -> Result<String, String> {
    let mut file = match File::create(file_path) {
        Ok(file) => file,
        Err(e) => return Err(e.to_string()),
    };
    match file.write_all(content.as_bytes()) {
        Ok(_) => Ok("Success".to_string()),
        Err(e) => Err(e.to_string()),
    }
}

// check if a file exists
#[tauri::command]
pub fn is_file_exist(file_path: &str) -> Result<bool, String> {
    match File::open(file_path) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

// copy a single file from source to destination
#[tauri::command]
pub fn copy_file(source: &str, destination: &str) -> Result<String, String> {
    match fs::copy(source, destination) {
        Ok(_) => Ok("Success".to_string()),
        Err(e) => Err(e.to_string()),
    }
}

// move a single file from source to destination
#[tauri::command]
pub fn move_file(source: &str, destination: &str) -> Result<String, String> {
    match fs::rename(source, destination) {
        Ok(_) => Ok("Success".to_string()),
        Err(e) => Err(e.to_string()),
    }
}

/**
 * Folder related functions
 */

// get all files in a folder, and return a vector of file info
#[derive(Debug, Serialize)]
pub struct FileInfo {
    pub full_name: String,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub path: String,
}

#[tauri::command]
pub fn get_folder_files(path: &str) -> Vec<FileInfo> {
    let mut result = Vec::new();
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                let path = entry.path();
                if metadata.is_dir() {
                    result.extend(get_folder_files(path.to_str().unwrap()));
                } else {
                    let file_name = entry.file_name().to_string_lossy().to_string();
                    let file_size = metadata.len();
                    let file_stem = path.file_stem().unwrap().to_string_lossy().to_string();
                    let extension = path
                        .extension()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_string();
                    let file_path = path.to_str().unwrap().to_string();
                    result.push(FileInfo {
                        full_name: file_name,
                        name: file_stem,
                        extension,
                        size: file_size,
                        path: file_path,
                    });
                }
            }
        }
    }
    result
}

// get all files in a folder, and return a vector of file info
#[tauri::command]
pub fn get_folder_file(path: &str) -> Vec<FileInfo> {
    let mut result = Vec::new();
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                let path = entry.path();
                if !metadata.is_dir() {
                    let file_name = entry.file_name().to_string_lossy().to_string();
                    let file_size = metadata.len();
                    let file_stem = path.file_stem().unwrap().to_string_lossy().to_string();
                    let extension = path
                        .extension()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_string();
                    let file_path = path.to_str().unwrap().to_string();
                    result.push(FileInfo {
                        full_name: file_name,
                        name: file_stem,
                        extension,
                        size: file_size,
                        path: file_path,
                    });
                }
            }
        }
    }
    result
}

// count all files include subfolder's file in a folder, and return the count
#[tauri::command]
pub fn count_folder_files(folder_path: &str, max_count: usize) -> Result<usize, String> {
    let mut count = 0;
    let dir = match fs::read_dir(folder_path) {
        Ok(dir) => dir,
        Err(e) => return Err(e.to_string()),
    };
    for entry in dir {
        let entry = match entry {
            Ok(entry) => entry,
            Err(e) => return Err(e.to_string()),
        };
        let path = entry.path();
        if path.is_file() {
            count += 1;
            if count > max_count {
                return Err("MAX_FILE_COUNT".to_string());
            }
        } else if path.is_dir() {
            match count_folder_files(path.to_str().unwrap(), max_count - count) {
                Ok(sub_count) => {
                    count += sub_count;
                    if count > max_count {
                        return Err("MAX_FILE_COUNT".to_string());
                    }
                }
                Err(e) => return Err(e),
            }
        }
    }
    Ok(count)
}

#[tauri::command]
pub fn count_folder_file(folder_path: &str, max_count: usize) -> Result<usize, String> {
    let mut count = 0;
    let dir = match fs::read_dir(folder_path) {
        Ok(dir) => dir,
        Err(e) => return Err(e.to_string()),
    };
    for entry in dir {
        let entry = match entry {
            Ok(entry) => entry,
            Err(e) => return Err(e.to_string()),
        };
        let path = entry.path();
        if path.is_file() {
            count += 1;
            if count > max_count {
                return Err("MAX_FILE_COUNT".to_string());
            }
        }
    }
    Ok(count)
}
