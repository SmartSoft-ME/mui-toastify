import React from "react";
import { type CloseButtonProps } from "../components";
import { type TransitionProps } from "@mui/material/transitions";
import { type DialogProps } from "@mui/material";

type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

export type TypeOptions = "info" | "success" | "warning" | "error" | "default";

export type Theme = "light" | "dark" | "colored";

export type DialogPosition =
    | "top-right"
    | "top-center"
    | "top-left"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left"
    | "center-center";

export interface DialogContentProps<Data = {}> {
    closeToast?: () => void;
    toastProps: ToastProps;
    data?: Data;
}

export type DialogContent<T = unknown> =
    | React.ReactNode
    | ((props: DialogContentProps<T>) => React.ReactNode);

export type Id = number | string;

export type DialogTransition =
    | React.FC<ToastTransitionProps>
    | React.ComponentClass<ToastTransitionProps>;

/**
 * ClassName for the elements - can take a function to build a classname or a raw string that is cx'ed to defaults
 */
export type ToastClassName =
    | ((context?: {
          type?: TypeOptions;
          defaultClassName?: string;
          position?: DialogPosition;
          rtl?: boolean;
      }) => string)
    | string;

export interface ClearWaitingQueueParams {
    containerId?: Id;
}

interface CommonOptions {
    /**
     * Pause the timer when the mouse hover the toast.
     * `Default: true`
     */
    pauseOnHover?: boolean;

    /**
     * Pause the toast when the window loses focus.
     * `Default: true`
     */
    pauseOnFocusLoss?: boolean;

    /**
     * Remove the toast when clicked.
     * `Default: true`
     */
    closeOnClick?: boolean;

    /**
     * Set the delay in ms to close the toast automatically.
     * Use `false` to prevent the toast from closing.
     * `Default: 5000`
     */
    autoClose?: number | false;

    /**
     * Set the default position to use.
     * `One of: 'top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-center', 'bottom-left'`
     * `Default: 'top-right'`
     */
    position?: DialogPosition;

    /**
     * Pass a custom close button.
     * To remove the close button pass `false`
     */
    closeButton?:
        | boolean
        | ((props: CloseButtonProps) => React.ReactNode)
        | React.ReactElement<CloseButtonProps>;

    /**
     * Pass a custom transition built with react-transition-group.
     */
    transition?: TransitionType;

    /**
     * Define the ARIA role for the toast
     * `Default: alert`
     *  https://www.w3.org/WAI/PF/aria/roles
     */
    role?: string;

    /**
     * Set id to handle multiple container
     */
    containerId?: Id;

    /**
     * Support right to left display.
     * `Default: false`
     */
    rtl?: boolean;

    /**
     * Theme to use.
     * `One of: 'light', 'dark', 'colored'`
     * `Default: 'light'`
     */
    theme?: Theme;
}

export interface DialogOptions<Data = {}> extends CommonOptions {
    /**
     * An optional css class to set.
     */
    className?: ToastClassName;

    /**
     * @deprecated
     * ⚠️ Will be removed in the next major release. You can rely on `toast.onChange` instead.
     *
     * Called when toast is mounted.
     */
    onOpen?: <T = {}>(props: T) => void;

    /**
     * @deprecated
     * ⚠️ Will be removed in the next major release. You can rely on `toast.onChange` instead.
     *
     * Called when toast is unmounted.
     */
    onClose?: <T = {}>(props: T) => void;

    /**
     * An optional inline style to apply.
     */
    style?: React.CSSProperties;

    /**
     * Set the toast type.
     * `One of: 'info', 'success', 'warning', 'error', 'default'`
     */
    type?: TypeOptions;

    /**
     * Set a custom `toastId`
     */
    toastId?: Id;

    /**
     * Used during update
     */
    updateId?: Id;

    /**
     * Add a delay in ms before the toast appear.
     */
    delay?: number;

    data?: Data;

    DialogProps?: Partial<DialogProps>;
    disableClose?: boolean;
}

export interface UpdateOptions<T = unknown> extends Nullable<DialogOptions<T>> {
    /**
     * Used to update a toast.
     * Pass any valid ReactNode(string, number, component)
     */
    render?: DialogContent<T>;
}

export interface ToastContainerProps extends CommonOptions {
    /**
     * An optional css class to set.
     */
    className?: ToastClassName;

    /**
     * Whether or not to display the newest toast on top.
     * `Default: false`
     */
    newestOnTop?: boolean;

    /**
     * An optional inline style to apply.
     */
    style?: React.CSSProperties;

    /**
     * An optional inline style to apply for the toast.
     */
    toastStyle?: React.CSSProperties;

    /**
     * An optional css class for the toast.
     */
    toastClassName?: ToastClassName;

    /**
     * Show the toast only if it includes containerId and it's the same as containerId
     * `Default: false`
     */
    enableMultiContainer?: boolean;

    /**
     * Limit the number of toast displayed at the same time
     */
    limit?: number;
}

export interface ToastTransitionProps {
    isIn: boolean;
    done: () => void;
    position: DialogPosition | string;
    preventExitTransition: boolean;
    nodeRef: React.RefObject<HTMLElement>;
    children?: React.ReactNode;
}

type TransitionType = React.JSXElementConstructor<
    TransitionProps & { children: React.ReactElement<any, any> }
>;

/**
 * @INTERNAL
 */
export interface ToastProps extends DialogOptions {
    isIn: boolean;
    staleId?: Id;
    toastId: Id;
    key: Id;
    transition: TransitionType | any; // ToastTransition; // (changed)
    closeToast: () => void;
    position: DialogPosition;
    children?: DialogContent;
    className?: ToastClassName;
    deleteToast: () => void;

    theme: Theme;
    type: TypeOptions;
    DialogProps?: DialogProps;
    iconOut?: React.ReactNode;
}

/**
 * @INTERNAL
 */
export interface NotValidatedToastProps extends Partial<ToastProps> {
    toastId: Id;
}

/**
 * @INTERNAL
 */
export interface Toast {
    content: DialogContent;
    props: ToastProps;
}

export type ToastItemStatus = "added" | "removed" | "updated";

export interface ToastItem<Data = {}> {
    content: DialogContent<Data>;
    id: Id;
    theme?: Theme;
    type?: TypeOptions;
    containerId?: Id;
    data: Data;
    status: ToastItemStatus;
}
