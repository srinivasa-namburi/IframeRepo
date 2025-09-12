import './App.scss';
import * as React from "react";
import {LuciadMap} from "./components/luciadmap/LuciadMap.tsx";
import {useRef, useState} from "react";
import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const App: React.FC = () => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const onShowTime = (status: boolean, errorMessage?:string) => {
        if (status) {
            setLoading(false);
            setError(null);
            // fade in the content
            requestAnimationFrame(() => {
                if (contentRef.current) {
                    contentRef.current.style.opacity = "1";
                }
            });
        } else {
            setLoading(false);
            if (errorMessage) setError(errorMessage);
            else setError("Failed to load the data. Verify the data url");
        }
    };

    // const handleFullscreen = () => {
    //     const elem = document.documentElement;
    //     if (!document.fullscreenElement) {
    //         elem.requestFullscreen().catch(err => console.error(err));
    //     } else {
    //         document.exitFullscreen();
    //     }
    // };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <div className="App">
                {/* Loading or error overlay */}
                {loading && (
                    <div className="LoadingOverlay">
                        <span className="LoadingText">
                            {error ? error : "Loading"}
                        </span>
                    </div>
                )}

                {/* Main app content that fades in */}
                <div className="AppContent" ref={contentRef} style={{opacity: 0}}>
                    <LuciadMap onShowTime={onShowTime}/>
                    {/*<FullscreenButton onClick={handleFullscreen}/>*/}
                    {/*<Attribution text="Green Cubes" url="https://www.google.com"/>*/}
                </div>
                {(!loading && error) && (
                    <div className="Errorverlay">
                        <span>
                            {error}
                        </span>
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
}

export default App;
