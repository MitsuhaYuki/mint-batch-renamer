// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Import config r/w module
mod cfgutils;
use cfgutils::is_config_exist;
use cfgutils::read_config;
use cfgutils::write_config;

// File system related module
mod fstools;
use fstools::copy_file;
use fstools::count_folder_files;
use fstools::get_folder_files;
use fstools::is_file_exist;
use fstools::read_file;
use fstools::select_folder;
use fstools::write_file;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // cfg module
            is_config_exist,
            read_config,
            write_config,
            // fs module
            copy_file,
            count_folder_files,
            get_folder_files,
            is_file_exist,
            read_file,
            select_folder,
            write_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
