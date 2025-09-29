import { useState, useLayoutEffect, useCallback } from 'react';

const useFullscreen = (ref) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const enterFullscreen = useCallback(() => {
        if (ref.current) {
            ref.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }
    }, [ref]);

    const exitFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }, []);

    useLayoutEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    return { isFullscreen, enterFullscreen, exitFullscreen };
};

export default useFullscreen;
