import AppBar from '@mui/material/AppBar';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';

import {Link as RouterLink, useLoaderData, Form } from 'react-router-dom';
import AddServer from '../components/AddServer';
import {gServers as serverStore, serverInfo} from '../ServerDataSource';
import ServerList from '../components/ServerList';

export async function serverLoader() : Promise<{servers: serverInfo[]}>
{
  const servers = await serverStore.loadServers();
  return { servers };
}

export default function Root() {
    const { servers } = useLoaderData() as {servers: serverInfo[]};

    return (
        <>
      		<AppBar id="topbar" position="static" >
            <h1 className='app-title'>Phototime Client - React</h1>
          </AppBar>
          <div className="page-body">
              {
              servers.length ? (
                <ServerList servers={servers} isNav={true}/>
              ) : (
                <>
                <p> Add a Server</p>
                <AddServer ></AddServer>
                </>
              )}
          </div>
          <AppBar className="myfooter" id="footer" position="static" sx={{ top: 'auto', bottom: 0 }}>
            <Link underline="none" component={RouterLink} to={'settings'}> <IconButton ><SettingsIcon fontSize="large"></SettingsIcon></IconButton></Link>
          </AppBar>
        </>
      );
    }