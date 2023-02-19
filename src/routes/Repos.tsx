import RepoList from '../components/RepoList';
import AppBar from '@mui/material/AppBar';
import { Params, useLoaderData, useNavigate } from 'react-router-dom';
import { gPhotoTimeAPI as photoTimeAPI} from '../api/PhototimeAPI';
import { appstate} from '../AppState';

import { gServers as servers, serverInfo } from '../ServerDataSource';
import IconButton from '@mui/material/IconButton';  
import BackIcon from '@mui/icons-material/NavigateBefore';
import { PhotoTimeConnection } from '../api/PhototimeConnection';

interface ReposLoaderProps {
    params: Params
}
interface ReposLoaderData {
    connection: PhotoTimeConnection,
    server: serverInfo,
    repos: any
}

export async function reposLoader( {params}: ReposLoaderProps )
{
    if (!params.serverId)
    {
        throw "no server id available";
    }

    const server = servers.getById(params.serverId);

    if (!server || !server.id)
    {
        throw "no server available";
    }

    appstate.setServerId(server.id);

    const connection = photoTimeAPI.connect(server);

    const repos = await connection.getRepos();

    return {
        connection: connection,
        server: server,
        repos: repos
    }
}

export default function Repos() {
    const loaderData = useLoaderData() as ReposLoaderData;
    const server = loaderData.server;
    const photoTimeConnection = loaderData.connection;
    const repos = loaderData.repos;
    const navigate = useNavigate();

    //console.log(appstate.getLocation());
    
    return (
        <>
        <AppBar id="topbar" position="static" >
            <h1 className='app-title'>PCR - {server.id}
            </h1>
          </AppBar>
          <div className="page-body">
            <RepoList repos={repos} server={server} cx={photoTimeConnection}/>
        </div>
        <AppBar className="myfooter" id="footer" position="static" >
            <IconButton onClick={() => {appstate.back();navigate(-1);}}><BackIcon/></IconButton>
        </AppBar>

        </>
    );
}
