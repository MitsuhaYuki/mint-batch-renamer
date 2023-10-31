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

// load tauri module
use tauri::{Manager, Window};

// close splashscreen. "async" is necessary here otherwise main thread will be block!
#[tauri::command]
async fn close_splashscreen(window: Window) {
    match window.get_window("splashscreen") {
        Some(w) => {
            w.close().unwrap();
            window
                .get_window("main")
                .expect("window \"main\" found!")
                .show()
                .unwrap();
        }
        None => (), // None => println!("window \"splashscreen\" already closed.")
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            // #[cfg(debug_assertions)]
            // {
            //     let window = _app.get_window("main").unwrap();
            //     window.open_devtools();
            //     // window.close_devtools();
            // }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // system utils
            close_splashscreen,
            std_path::path_is_dir,
            tauri_fs::fs_copy_file,
            tauri_fs::fs_create_dir,
            tauri_fs::fs_exists,
            tauri_fs::fs_read_text_file,
            tauri_fs::fs_remove_file,
            tauri_fs::fs_rename_file,
            tauri_fs::fs_write_text_file,
            // module util
            fetch::fetch_file_count,
            fetch::fetch_file_list
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
