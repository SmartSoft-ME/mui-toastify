// https://github.com/yannickcr/eslint-plugin-react/issues/3140
/* eslint react/prop-types: "off" */
import React, { forwardRef, type StyleHTMLAttributes, useEffect } from "react";
import cx from "clsx";

import { Toast } from "./Model";
import { CloseButton } from "./CloseButton";
import { Default, parseClassName, isFn } from "../utils";
import { useDialogContainer } from "../hooks/useDialogContainer";
import { type ToastContainerProps, type DialogPosition } from "../types";

export const DialogContainer = forwardRef<HTMLDivElement, ToastContainerProps>(
  (props, ref) => {
    const { getToastToRender, containerRef, isToastActive } =
      useDialogContainer(props);
    const { className, style, rtl, containerId } = props;

    function getClassName(position: DialogPosition) {
      const defaultClassName = cx(
        `${Default.CSS_NAMESPACE}__toast-container`,
        `${Default.CSS_NAMESPACE}__toast-container--${position}`,
        { [`${Default.CSS_NAMESPACE}__toast-container--rtl`]: rtl },
      );
      return isFn(className)
        ? className({
            position,
            rtl,
            defaultClassName,
          })
        : cx(defaultClassName, parseClassName(className));
    }

    useEffect(() => {
      if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement>).current =
          containerRef.current!;
      }
    }, []);

    return (
      <div
        ref={containerRef}
        className={Default.CSS_NAMESPACE as string}
        id={containerId as string}
      >
        {getToastToRender((position, toastList) => {
          const containerStyle: React.CSSProperties = !toastList.length
            ? { ...style, pointerEvents: "none" }
            : { ...style };

          return (
            <div
              className={getClassName(position)}
              style={containerStyle}
              key={`container-${position}`}
            >
              {toastList.map(({ content, props: toastProps }, i) => {
                return (
                  <Toast
                    {...toastProps}
                    isIn={isToastActive(toastProps.toastId)}
                    style={
                      {
                        ...toastProps.style,
                        "--nth": i + 1,
                        "--len": toastList.length,
                      } as StyleHTMLAttributes<HTMLDivElement>
                    }
                    key={`toast-${toastProps.key}`}
                  >
                    {content}
                  </Toast>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  },
);

DialogContainer.displayName = "ToastContainer";

DialogContainer.defaultProps = {
  position: "center-center",
  autoClose: 5000,
  closeButton: CloseButton,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  closeOnClick: true,
  role: "alert",
  theme: "light",
};
