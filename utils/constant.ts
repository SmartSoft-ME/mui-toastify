import { type DialogPosition, type TypeOptions } from "../types";

type KeyOfPosition =
  | "TOP_LEFT"
  | "TOP_RIGHT"
  | "TOP_CENTER"
  | "BOTTOM_LEFT"
  | "BOTTOM_RIGHT"
  | "BOTTOM_CENTER";

type KeyOfType = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "DEFAULT";

export const POSITION: { [key in KeyOfPosition]: DialogPosition } = {
  TOP_LEFT: "top-left",
  TOP_RIGHT: "top-right",
  TOP_CENTER: "top-center",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_RIGHT: "bottom-right",
  BOTTOM_CENTER: "bottom-center",
};

/**
 * @deprecated
 */
export const TYPE: { [key in KeyOfType]: TypeOptions } = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  DEFAULT: "default",
};

export const enum Type {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  DEFAULT = "default",
}

export const enum Default {
  COLLAPSE_DURATION = 300,
  DEBOUNCE_DURATION = 50,
  CSS_NAMESPACE = "Toastify",
}

export const enum SyntheticEvent {
  ENTRANCE_ANIMATION_END = "d",
}
