import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  type DialogContent as DialogContentType,
  type DialogContentProps,
} from "../types";
import {
  type ElementType,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
  useCallback,
} from "react";
import { isFn, isStr } from "../utils";
import LoadingButton, { type LoadingButtonProps } from "@mui/lab/LoadingButton";
import { useImmer } from "use-immer";

function getContent<TData>(
  Content: DialogContentType<TData>,
  { toastProps, closeToast, data }: DialogContentProps<TData>,
) {
  let toastContent = Content;

  if (isValidElement(Content) && !isStr(Content.type)) {
    toastContent = cloneElement(Content as ReactElement, {
      closeToast,
      toastProps,
      data,
    });
  } else if (isFn(Content)) {
    toastContent = Content({ closeToast, toastProps, data });
  }

  return toastContent as ReactNode;
}

export interface ActionDialogMessageComponentProps {
  RejectButtonProps?: LoadingButtonProps;
  ResolvedButtonProps?: LoadingButtonProps;
  rejectTitle?: string;
  resolvedTitle?: string;
  showResolvedAction?: boolean;
}

export interface MessageDialogProps {
  ActionComponent?: ElementType<DialogContentProps<MessageDialogProps>>;
  ActionComponentProps?: ActionDialogMessageComponentProps;
  onResolved: () => Promise<void> | void;
  onReject: () => Promise<void> | void;
  Title?: DialogContentProps<MessageDialogProps>;
}

export function WithMessageToast(Content: DialogContentType<any>) {
  return function Message(props: DialogContentProps<MessageDialogProps>) {
    const ActionComponent = !!props.data?.ActionComponent
      ? props.data?.ActionComponent
      : DefaultDialogMessageActionComponent;

    return (
      <>
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <>
            {props.toastProps.iconOut != null && (
              <div
                style={{
                  marginInlineEnd: "10px",
                  width: "34px",
                  flexShrink: 0,
                  display: "flex",
                }}
              >
                {props.toastProps.iconOut}
              </div>
            )}
            {getContent(props.data?.Title as any, props)}
          </>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>{getContent(Content, props)}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <ActionComponent {...props} />
        </DialogActions>
      </>
    );
  };
}

function DefaultDialogMessageActionComponent(
  props: DialogContentProps<MessageDialogProps>,
) {
  const showResolvedAction =
    props.data?.ActionComponentProps?.showResolvedAction ?? true;
  const [loading, setLoading] = useImmer({
    rejectLoading: false,
    resolvedLoading: false,
  });

  const onRejectHandler = useCallback(async () => {
    if (props.closeToast) props.closeToast();
    if (!!props.data?.onReject) {
      try {
        setLoading((e) => {
          e.rejectLoading = false;
        });
        await props.data?.onReject();
      } catch (err) {
      } finally {
        setLoading((e) => {
          e.rejectLoading = false;
        });
      }
    }
  }, [props.closeToast, props.data?.onReject]);

  const onResolvedHandler = useCallback(async () => {
    if (!!props.data?.onResolved)
      try {
        setLoading((e) => {
          e.resolvedLoading = true;
        });
        await props.data?.onResolved();
      } catch (err) {
      } finally {
        setLoading((e) => {
          e.resolvedLoading = false;
        });
      }

    if (props.closeToast) props.closeToast();
  }, [props.closeToast, props.data?.onReject]);

  return (
    <>
      <LoadingButton
        {...props.data?.ActionComponentProps?.RejectButtonProps}
        disabled={loading.resolvedLoading}
        onClick={onRejectHandler}
        loading={loading.rejectLoading}
      >
        {props.data?.ActionComponentProps?.rejectTitle || "Cancel"}
      </LoadingButton>
      {showResolvedAction ? (
        <LoadingButton
          {...props.data?.ActionComponentProps?.ResolvedButtonProps}
          onClick={onResolvedHandler}
          loading={loading.resolvedLoading}
        >
          {props.data?.ActionComponentProps?.resolvedTitle || "Resolve"}
        </LoadingButton>
      ) : null}
    </>
  );
}

