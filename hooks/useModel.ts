import { useState, useRef, useEffect, isValidElement } from "react";

import { isFn, SyntheticEvent } from "../utils";
import { type ToastProps } from "../types";

export function useToast(props: ToastProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [preventExitTransition] = useState(false);
    const toastRef = useRef<HTMLDivElement>(null);

    const syncProps = useRef(props);
    // const { autoClose, pauseOnHover, closeToast, closeOnClick } = props;

    useEffect(() => {
        syncProps.current = props;
    });

    useEffect(() => {
        if (toastRef.current)
            toastRef.current.addEventListener(
                SyntheticEvent.ENTRANCE_ANIMATION_END,
                playToast,
                { once: true }
            );

        if (isFn(props.onOpen))
            props.onOpen(
                isValidElement(props.children) && props.children.props
            );

        return () => {
            const props = syncProps.current;
            if (isFn(props.onClose))
                props.onClose(
                    isValidElement(props.children) && props.children.props
                );
        };
    }, []);

    useEffect(() => {
        props.pauseOnFocusLoss && bindFocusEvents();
        return () => {
            props.pauseOnFocusLoss && unbindFocusEvents();
        };
    }, [props.pauseOnFocusLoss]);

    function playToast() {
        setIsRunning(true);
    }

    function pauseToast() {
        setIsRunning(false);
    }

    function bindFocusEvents() {
        if (!document.hasFocus()) pauseToast();

        window.addEventListener("focus", playToast);
        window.addEventListener("blur", pauseToast);
    }

    function unbindFocusEvents() {
        window.removeEventListener("focus", playToast);
        window.removeEventListener("blur", pauseToast);
    }

    return {
        playToast,
        pauseToast,
        isRunning,
        preventExitTransition,
        toastRef,
    };
}
