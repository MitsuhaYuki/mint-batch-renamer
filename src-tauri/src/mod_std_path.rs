// Re-export the fs module from the `tauri` crate.
use std::path;
use thiserror;

// create the error type that represents all errors possible in our program
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

// manually implement serde::Serialize
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

// manually declare the result type
// pub type SerializedResult<T> = std::result::Result<T, Error>;

// is dir
#[tauri::command]
pub fn path_is_dir(path: &str) -> bool {
    path::Path::new(path).is_dir()
}