import React, {forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Form } from 'react-router-dom';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import CSS from 'csstype';

const popupStyle: CSS.Properties = {
	/* force center left / right */
	/*
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%,-50%)',
	*/
	/* don't force height */
	/*bottom: 'auto' */
  };
  

interface AddTagPopupProps 
{
    onSubmit: (tag: string) => void;
}

function AddTagPopup({onSubmit}: AddTagPopupProps, ref:any) {
	const [ isAddTagOpen, setIsAddTagOpen] = React.useState(false);

	const tagInputRef=useRef<HTMLInputElement>(null);
	
    const handleAddTagClose = () => { setIsAddTagOpen(false);}

	const handleAddTagSubmit = async function (e: any) {
		e.preventDefault();
		// collect tag value
		// add to tags
		/*
		// if wrapped in form and using onSubmit
        const formData = e.target;// as Form;
        
        var tag = e.target.elements.tag.value;
		*/

		// using button click event instead..
		if (tagInputRef?.current?.value) {
			const tag = tagInputRef.current.value;

			try {
				onSubmit(tag);
			} catch (ex) {
				console.warn(ex);
			}
		}

		// dismiss dialog
		setIsAddTagOpen(false);
	};

    useImperativeHandle(ref, () => ({
        show: () => setIsAddTagOpen(true),
    }));

	useEffect( () => {
		// this effect is to autofocus to input when in a dialog
		if (isAddTagOpen) {
			// wait until dom rendered (after this call)
			setTimeout(() => {
				if (tagInputRef && tagInputRef.current) {
					tagInputRef.current.focus();
				}
			}, 50);
		}
	}, [isAddTagOpen]);
	
	const onTextFieldKeyDown: React.KeyboardEventHandler<HTMLElement> = function(ev){
		if (ev.key ==  'Enter') {
			handleAddTagSubmit(ev);
		}
	}
    return (
<>
    <Dialog open={isAddTagOpen} onClose={handleAddTagClose} sx={popupStyle} >
			<DialogTitle>Enter New Tag</DialogTitle>
			<DialogContent>
					<TextField onKeyDown={onTextFieldKeyDown} inputRef={ tagInputRef } margin="dense" fullWidth 
						id="tag" name="tag" type="text" placeholder="tag" label="tag" variant="standard"></TextField>
					<DialogActions>
						<Button variant="contained" onClick={handleAddTagClose}>Cancel</Button>
						<Button variant="contained" onClick={handleAddTagSubmit}>Add</Button>
					</DialogActions>
			</DialogContent>
	</Dialog>
</>
    );
}

export default forwardRef(AddTagPopup);