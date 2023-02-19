import React, {forwardRef, useImperativeHandle, MouseEvent, MouseEventHandler , ElementType, SyntheticEvent} from "react";

import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';

import CloseIcon from '@mui/icons-material/Close';
import { SnackbarCloseReason } from "@mui/base";


interface ButteredToastProps
{
	autoHideDuration?: number;
}


function ButteredToast({autoHideDuration} : ButteredToastProps, ref: any)
{
	const [ isToastOpen, setIsToastOpen ] = React.useState(false);
    const [ message, setMessage ] = React.useState("");

	const hclose2 = (event: React.MouseEvent<HTMLElement>, text: string) => {
		setIsToastOpen(false);
	}

    const handleToastClose = (event: Event | SyntheticEvent<any, Event>, reason: SnackbarCloseReason) => {
		if (reason == 'clickaway') {
			return;
		}
		setIsToastOpen(false);
	}
	const toastAction = (
		<React.Fragment>
		  <IconButton
			size="small"
			aria-label="close"
			color="inherit"
			onClick={(e) => {hclose2(e, "clicked")}}
		  >
			<CloseIcon fontSize="small" />
		  </IconButton>
		</React.Fragment>
	  );

      useImperativeHandle(ref, () => ({
        show: (messageToShow: string) => {
            setMessage(messageToShow);
            setIsToastOpen(true);
        },
    }));

    return (
        <>
            <Snackbar
				open={isToastOpen}
				autoHideDuration={2000}
				onClose={(e, reason) => {handleToastClose(e, reason)}}
				message={message} 
				action={toastAction}
			/>
        </>
    )

}

export default forwardRef(ButteredToast);