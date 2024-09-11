import React, { type ReactNode } from "react";
import { type ToastProps } from "../types";
import { useToast } from "../hooks/useModel";
import { Dialog } from "@mui/material";

export const Toast: React.FC<ToastProps> = (props) => {
  const { toastRef } = useToast(props);
  const { 
    children, 
    closeToast,
    transition: Transition,
    position,  
    role, 
    toastId, 
    isIn, 
    disableClose = false,
    DialogProps,
  } = props; 
  return (
    <Dialog
      onClose={()=>{
        if(!disableClose){
          closeToast()
        }
      }}
      {...DialogProps}
      open={isIn}
      role={role}
      TransitionComponent={Transition}
      PaperProps={{
        sx: { m: 0 },
        className: `${position}`,
        ...DialogProps?.PaperProps,
      }}
      id={toastId as string}
      ref={toastRef}
    >
      {children as ReactNode}
    </Dialog>
  );
};
