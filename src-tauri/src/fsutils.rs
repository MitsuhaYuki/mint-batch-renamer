// 引入外部库
use nfd::Response;
use std::path::PathBuf;

// 定义一个函数，返回一个Result类型，包含一个PathBuf类型的值或者一个String类型的错误信息
#[tauri::command]
pub fn select_folder() -> Result<PathBuf, String> {
    // 调用nfd库的open_pick_folder函数，打开一个文件选择器
    match nfd::open_pick_folder(None) {
        // 如果成功，返回选择的文件夹路径
        Ok(Response::Okay(path)) => Ok(PathBuf::from(path)),
        // handle OkayMultiple path, and process all selected string path, and join all path string using ";"
        Ok(Response::OkayMultiple(paths)) => {
            let mut path = String::new();
            for p in paths {
                path.push_str(&p);
                path.push(';');
            }
            Ok(PathBuf::from(path))
        }
        // 如果取消，返回一个错误信息
        Ok(Response::Cancel) => Err("Canceled".to_string()),
        // 如果出现其他错误，返回错误信息
        Err(e) => Err(e.to_string()),
    }
}

use serde::Serialize;
use std::fs;

#[derive(Debug, Serialize)]
pub struct FileInfo {
    pub full_name: String,
    pub name: String,
    pub size: u64,
    pub extension: String,
    pub path: String,
}

#[tauri::command]
pub fn get_folder_files(path: &str) -> Vec<FileInfo> {
    let mut result = Vec::new();
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() {
                    result.extend(get_folder_files(path.to_str().unwrap()));
                } else {
                    let metadata = fs::metadata(&path).unwrap();
                    let file_name = entry.file_name().into_string().unwrap();
                    let file_size = metadata.len();
                    let file_stem = path
                        .file_stem()
                        .unwrap()
                        .to_str()
                        .unwrap()
                        .to_string();
                    let extension = path
                        .extension()
                        .unwrap_or_default()
                        .to_str()
                        .unwrap()
                        .to_string();
                    let file_path = path.to_str().unwrap().to_string();
                    result.push(FileInfo {
                        full_name: file_name,
                        name: file_stem,
                        size: file_size,
                        extension,
                        path: file_path,
                    });
                }
            }
        }
    }
    result
}

#[tauri::command]
// 声明一个copy_single_file方法，接收两个字符串参数
pub fn copy_single_file(source_path: &str, target_path: &str) -> Result<String, String> {
    // 引入std::fs模块，用于文件操作
    use std::fs;
    // 尝试复制文件，如果出错则打印错误信息
    match fs::copy(source_path, target_path) {
        Ok(_) => Ok("Success".to_string()),
        Err(e) => Err(e.to_string()),
    }
}

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
                },
                Err(e) => return Err(e),
            }
        }
    }
    Ok(count)
}
// pub fn count_folder_files(folder_path: &str) -> Result<usize, String> {
//     let mut count = 0;
//     let dir = match fs::read_dir(folder_path) {
//         Ok(dir) => dir,
//         Err(e) => return Err(e.to_string()),
//     };
//     for entry in dir {
//         let entry = match entry {
//             Ok(entry) => entry,
//             Err(e) => return Err(e.to_string()),
//         };
//         let path = entry.path();
//         if path.is_file() {
//             count += 1;
//         } else if path.is_dir() {
//             match count_folder_files(path.to_str().unwrap()) {
//                 Ok(sub_count) => count += sub_count,
//                 Err(e) => return Err(e),
//             }
//         }
//     }
//     Ok(count)
// }