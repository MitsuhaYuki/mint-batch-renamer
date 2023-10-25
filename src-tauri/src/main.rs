// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// serializer for tauri
mod serializer;
// repack of other crates
mod repack;
use repack::std_path;
use repack::tauri_fs;
// module for util
mod util;
use util::fetch;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            std_path::path_is_dir,
            tauri_fs::fs_copy_file,
            tauri_fs::fs_exists,
            tauri_fs::fs_read_text_file,
            tauri_fs::fs_remove_file,
            tauri_fs::fs_write_text_file,
            // module util
            fetch::fetch_file_count,
            fetch::fetch_file_list
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
