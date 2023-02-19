//import  AddServerModal  from '../components/addservermodal';
import React, {useState } from "react";
import AppBar from '@mui/material/AppBar';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import  AddIcon from '@mui/icons-material/Add';
import  CloseIcon from '@mui/icons-material/Close';
import {Link as RouterLink, useLoaderData } from 'react-router-dom';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';

import AddServer  from '../components/AddServer';
import ServerList from '../components/ServerList';
import {serverInfo } from '../ServerDataSource';

const popupStyle = {
  /* force center left / right */
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',

  /* don't force height */
  bottom: 'auto'
};

import {gServers as serverStore} from '../ServerDataSource';

export async function serverLoader() : Promise<{servers: serverInfo[]}>
{
  const servers = await serverStore.loadServers();
  return { servers };
}

function useForceUpdate() {
  let [value, setState] = useState(true);
  return () => setState(!value);
}

export default function Settings()
{
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => { setOpen(true);}
    const handleClose = () => setOpen(false);
    const forceUpdate = useForceUpdate();

    const handleAddServer = () => {
      console.log("added server");
      setOpen(false);
      //forceUpdate();
    }
    const handleDeleteServer =  (serverId: string) => {
      serverStore.deleteById(serverId);
      console.log(`delete server: ${serverId}`);
      serverStore.storeServers();
      forceUpdate();

      //setServers(serverStore.loadServers()); 
    }

    const { servers } = useLoaderData() as {servers: serverInfo[]};

    return (
      <>
        <AppBar id="topbar" position="static" >
          <h1 className='app-title'>Phototime Client - React - Servers</h1>
        </AppBar>
        <div className="page-body">
          <ServerList servers={servers} isNav={false} onAction={(serverId) => handleDeleteServer(serverId)} />
          <>
            <Dialog open={open} onClose={handleClose} sx={popupStyle}>
              <>
                <div className='popup-frame'>
                  <DialogTitle>Enter Server Details</DialogTitle>
                  <AddServer onAdd={handleAddServer}/>
                </div>
              </>
            </Dialog>
          </>
        </div>
        <AppBar className="myfooter" id="footer" position="static" sx={{ top: 'auto', bottom: 0 }}>
          <IconButton  onClick={ () => {handleOpen();}}><AddIcon fontSize="large"></AddIcon></IconButton>
          <Link underline="none" component={RouterLink} to={'/'}> <IconButton  ><CloseIcon fontSize="large"></CloseIcon></IconButton></Link>
        </AppBar>
      </>
    );
}