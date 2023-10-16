import { IGlobalReducerAction, IGlobalState } from '@/context/global'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { useEffect } from 'react'

const useTauriEvent = (
  globalData: IGlobalState,
  globalDispatch: (data: IGlobalReducerAction) => void
) => {
  const fileDropHandler = async (): Promise<() => any> => {
    return await listen<string>('tauri://file-drop', async (event) => {
      console.log('File drop event with payload:', event)
      if (Array.isArray(event.payload)) {
        const dirPath: string[] = []
        for (const path of event.payload) {
          const pathIsDir = await invoke('path_is_dir', { path })
          if (pathIsDir) {
            console.log(`I: Path ${path} is a directory`)
            dirPath.push(path)
          } else {
            console.log(`I: Path ${path} is not a directory`)
          }
        }
        console.log('I: all validate dir is', dirPath)
        globalDispatch({ type: 'u_source', payload: dirPath })
      }
    })
  }

  useEffect(() => {
    const evtHandler = fileDropHandler()
    return () => {
      evtHandler.then(unlisten => unlisten())
    }
  })
}

export {
  useTauriEvent
}