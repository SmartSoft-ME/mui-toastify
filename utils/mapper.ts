import { type Toast, type ToastItem, type ToastItemStatus } from "../types";

export function toToastItem(toast: Toast, status: ToastItemStatus): ToastItem {
  return {
    content: toast.content,
    containerId: toast.props.containerId,
    id: toast.props.toastId,
    theme: toast.props.theme,
    data: toast.props.data || {},
    status,
  };
}
