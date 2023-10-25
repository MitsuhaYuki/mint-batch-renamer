// import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './layout/App'
import 'antd/dist/reset.css'

// temporary disable to prevent double render
// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// )

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)