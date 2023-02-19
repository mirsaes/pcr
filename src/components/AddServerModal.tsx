import AddServer  from './AddServer';
import Modal from '@mui/material/Modal';

interface AddServerModalProps
{
    open: boolean;
    setOpen: (isOpen: boolean) => void;
}

export default function AddServerModal(props: AddServerModalProps)
{
    const open = props.open;
    const setOpen = props.setOpen;
    //const [open, setOpen] = React.useState(false);
    const handleClose = () => setOpen(false);

    return (
        <>
        <Modal open={open}
            onClose={()=>{handleClose();}}
            >
            <>
            <AddServer />
            </>
        </Modal>
        </>
    )
    
}
