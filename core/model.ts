import { POSITION, isStr, isNum, isFn, Type } from "../utils";
import { eventManager, type OnChangeCallback, Event } from "./eventManager";
import {
  type DialogOptions,
  type ToastProps,
  type Id,
  type UpdateOptions,
  type ClearWaitingQueueParams,
  type NotValidatedToastProps,
  type TypeOptions,
  type DialogContent,
} from "../types";
import { type ContainerInstance } from "../hooks";
import {
  type MessageDialogProps,
  WithMessageToast,
} from "../components/WithMessageToast";
import { type ButtonProps, Zoom } from "@mui/material";

interface EnqueuedToast {
  content: DialogContent<any>;
  options: NotValidatedToastProps;
}

let containers = new Map<ContainerInstance | Id, ContainerInstance>();
let latestInstance: ContainerInstance | Id;
let queue: EnqueuedToast[] = [];
let TOAST_ID = 1;

/**
 * Get the toast by id, given it's in the DOM, otherwise returns null
 */
function getToast(toastId: Id, { containerId }: DialogOptions) {
  const container = containers.get(containerId || latestInstance);
  return container && container.getToast(toastId);
}

/**
 * Generate a random toastId
 */
function generateToastId() {
  return `${TOAST_ID++}`;
}

/**
 * Generate a toastId or use the one provided
 */
function getToastId(options?: DialogOptions) {
  return options && (isStr(options.toastId) || isNum(options.toastId))
    ? options.toastId
    : generateToastId();
}

/**
 * If the container is not mounted, the toast is enqueued and
 * the container lazy mounted
 */
function dispatchToast<TData>(
  content: DialogContent<TData>,
  options: NotValidatedToastProps,
): Id {
  if (containers.size > 0) {
    eventManager.emit(Event.Show, content, options);
  } else {
    queue.push({ content, options });
  }

  return options.toastId;
}

/**
 * Merge provided options with the defaults settings and generate the toastId
 */
function mergeOptions(type: string, options?: DialogOptions) {
  return {
    ...options,
    type: (options && options.type) || type,
    toastId: getToastId(options),
  } as NotValidatedToastProps;
}

function createToastByType<TData = MessageDialogProps>(type: string) {
  return <TData = MessageDialogProps>(
    content: DialogContent<TData>,
    options?: DialogOptions,
  ) => dispatchToast(WithMessageToast(content), mergeOptions(type, options));
}

function model<TData = unknown>(
  content: DialogContent<TData>, // data message
  options?: DialogOptions, // toast
) {
  return dispatchToast(content, mergeOptions(Type.DEFAULT, options));
}

function modelMessage<TData = unknown>(
  content: DialogContent<TData>, // data message
  options?: DialogOptions, // toast
) {
  return dispatchToast(
    WithMessageToast(content),
    mergeOptions(Type.DEFAULT, options),
  );
}

model.loading = <TData = unknown>(
  content: DialogContent<TData>,
  options?: DialogOptions,
) =>
  dispatchToast(
    content,
    mergeOptions(Type.DEFAULT, {
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      ...options,
    }),
  );

export interface ToastPromiseParams<
  TData = unknown,
  TError = unknown,
  TPending = unknown,
> {
  pending?: string | UpdateOptions<TPending>;
  success?: string | UpdateOptions<TData>;
  error?: string | UpdateOptions<TError>;
}

function handlePromise<TData = unknown, TError = unknown, TPending = unknown>(
  promise: Promise<TData> | (() => Promise<TData>),
  { pending, error, success }: ToastPromiseParams<TData, TError, TPending>,
  options?: DialogOptions,
) {
  let id: Id;

  if (pending) {
    id = isStr(pending)
      ? model.loading(pending, options)
      : model.loading(pending.render, {
          ...options,
          ...(pending as DialogOptions),
        });
  }

  const resetParams = {
    autoClose: null,
    closeOnClick: null,
    closeButton: null,
    delay: 100,
  };

  const resolver = <T>(
    type: TypeOptions,
    input: string | UpdateOptions<T> | undefined,
    result: T,
  ) => {
    // Remove the toast if the input has not been provided. This prevents the toast from hanging
    // in the pending state if a success/error toast has not been provided.
    if (input == null) {
      model.dismiss(id);
      return;
    }

    const baseParams = {
      type,
      ...resetParams,
      ...options,
      data: result,
    };
    const params = isStr(input) ? { render: input } : input;

    // if the id is set we know that it's an update
    if (id) {
      model.update(id, {
        ...baseParams,
        ...params,
      } as UpdateOptions);
    } else {
      // using toast.promise without loading
      model(params!.render, {
        ...baseParams,
        ...params,
      } as DialogOptions);
    }

    return result;
  };

  const p = isFn(promise) ? promise() : promise;

  //call the resolvers only when needed
  p.then((result) => resolver("success", success, result)).catch((err) =>
    resolver("error", error, err),
  );

  return p;
}

async function Confirm(message: string) {
  return new Promise((resolve) => {
    model.warn(message, {
      data: {
        Title: "Confirm",
        onResolved() {
          resolve(true);
        },
        onReject() {
          resolve(false);
        },
        ActionComponentProps: {
          rejectTitle: "Cancel",
          resolvedTitle: "Ok",
          RejectButtonProps: {
            variant: "contained",
            color: "error",
          } as ButtonProps,
          ResolvedButtonProps: {
            variant: "contained",
            color: "primary",
          } as ButtonProps,
        },
      },
      disableClose: true,
      transition: Zoom,
      DialogProps: {
        maxWidth: "xs",
        fullWidth: true,
      },
    });
  });
}

model.promise = handlePromise;
model.success = createToastByType(Type.SUCCESS);
model.info = createToastByType(Type.INFO);
model.error = createToastByType(Type.ERROR);
model.warning = createToastByType(Type.WARNING);
model.warn = model.warning;
model.modelMessage = modelMessage;
model.confirm = Confirm;
model.dark = (content: DialogContent, options?: DialogOptions) =>
  dispatchToast(
    content,
    mergeOptions(Type.DEFAULT, {
      theme: "dark",
      ...options,
    }),
  );

/**
 * Remove toast programmaticaly
 */
model.dismiss = (id?: Id) => {
  if (containers.size > 0) {
    eventManager.emit(Event.Clear, id);
  } else {
    queue = queue.filter((t) => id != null && t.options.toastId !== id);
  }
};

/**
 * Clear waiting queue when limit is used
 */
model.clearWaitingQueue = (params: ClearWaitingQueueParams = {}) =>
  eventManager.emit(Event.ClearWaitingQueue, params);

/**
 * return true if one container is displaying the toast
 */
model.isActive = (id: Id) => {
  let isToastActive = false;

  containers.forEach((container) => {
    if (container.isToastActive && container.isToastActive(id)) {
      isToastActive = true;
    }
  });

  return isToastActive;
};

model.update = <TData = unknown>(
  toastId: Id,
  options: UpdateOptions<TData> = {},
) => {
  // if you call toast and toast.update directly nothing will be displayed
  // this is why I defered the update
  setTimeout(() => {
    const toast = getToast(toastId, options as DialogOptions);
    if (toast) {
      const { props: oldOptions, content: oldContent } = toast;

      const nextOptions = {
        ...oldOptions,
        ...options,
        toastId: options.toastId || toastId,
        updateId: generateToastId(),
      } as ToastProps & UpdateOptions;

      if (nextOptions.toastId !== toastId) nextOptions.staleId = toastId;

      const content = nextOptions.render || oldContent;
      delete nextOptions.render;

      dispatchToast(content, nextOptions);
    }
  }, 0);
};

/**
 * Subscribe to change when a toast is added, removed and updated
 *
 * Usage:
 * ```
 * const unsubscribe = toast.onChange((payload) => {
 *   switch (payload.status) {
 *   case "added":
 *     // new toast added
 *     break;
 *   case "updated":
 *     // toast updated
 *     break;
 *   case "removed":
 *     // toast has been removed
 *     break;
 *   }
 * })
 * ```
 */
model.onChange = (callback: OnChangeCallback) => {
  eventManager.on(Event.Change, callback);
  return () => {
    eventManager.off(Event.Change, callback);
  };
};

model.POSITION = POSITION;

/**
 * Wait until the ToastContainer is mounted to dispatch the toast
 * and attach isActive method
 */
eventManager
  .on(Event.DidMount, (containerInstance: ContainerInstance) => {
    latestInstance = containerInstance.containerId || containerInstance;
    containers.set(latestInstance, containerInstance);

    queue.forEach((item) => {
      eventManager.emit(Event.Show, item.content, item.options);
    });

    queue = [];
  })
  .on(Event.WillUnmount, (containerInstance: ContainerInstance) => {
    containers.delete(containerInstance.containerId || containerInstance);

    if (containers.size === 0) {
      eventManager
        .off(Event.Show)
        .off(Event.Clear)
        .off(Event.ClearWaitingQueue);
    }
  });

export { model };
