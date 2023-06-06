// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Import config r/w module
mod cfgutils;
use cfgutils::is_config_exist;
use cfgutils::read_config;
use cfgutils::write_config;

// Import file system operation module
mod fsutils;
use fsutils::copy_single_file;
use fsutils::count_folder_files;
use fsutils::get_folder_files;
use fsutils::select_folder;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            is_config_exist,
            read_config,
            write_config,
            copy_single_file,
            count_folder_files,
            get_folder_files,
            select_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
