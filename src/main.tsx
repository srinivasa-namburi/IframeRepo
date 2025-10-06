// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {DeviceOrientationProvider} from "ipad-device-orientation";
// import {StrictMode} from "react";

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

createRoot(document.getElementById('root')!).render(
    <DeviceOrientationProvider>
        <App />
    </DeviceOrientationProvider>
)
