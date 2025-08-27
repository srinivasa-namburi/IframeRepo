import './App.scss'
import * as React from "react";
import {LuciadMap} from "./components/luciadmap/LuciadMap.tsx";
import {FullscreenButton} from "./components/fullscreen/FullscreenButton.tsx";
import {useRef} from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        mode: 'dark', // or 'dark'
    },
});

const App: React.FC = () => {
    const appRef = useRef<HTMLDivElement | null>(null);

    const onShowTime = () => {
        // Trigger fade-in on mount
        requestAnimationFrame(() => {
            if (appRef.current) {
                appRef.current.style.opacity = "1";
            }
        });
    };

    const handleFullscreen = () => {
        const elem = document.documentElement; // fullscreen the whole page
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App" ref={appRef}>
            <LuciadMap onShowTime={onShowTime}/>
            <FullscreenButton onClick={handleFullscreen} />
        </div>
    </ThemeProvider>
    );
}

export default App
