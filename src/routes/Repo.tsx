import { Params, useLoaderData, useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';  
import BackIcon from '@mui/icons-material/NavigateBefore';
//import { Hidden, unstable_useEnhancedEffect } from '@mui/material';

import { gPhotoTimeAPI as photoTimeAPI} from '../api/PhototimeAPI';
import { gServers as servers, serverInfo } from '../ServerDataSource';
import RepoItemList from "../components/RepoItemList";
import { appstate } from '../AppState';

import {RequestParamLoaderProps } from './RequestParamLoaderProps';

interface RepoLoaderData
{
    connection: any,
    server: serverInfo,
    repoId: string,
    repo: any
}

export async function repoLoader( {request, params}: RequestParamLoaderProps ): Promise<any>
{
    const url = new URL(request.url);
    const repoId=url.searchParams.get("repoId");

    if (!params.serverId) {
        throw "no server  id found";
    }

    if (!repoId) {
        throw "no repo id found";
    }

    appstate.setServerId(params.serverId);
    appstate.setRepoId(repoId);

    //console.log(params.serverId);
    //console.log(`repoId=${repoId}`);

    const server = servers.getById(params.serverId);
    if (!server) {
        throw "unable to find server";
    }
    const connection = photoTimeAPI.connect(server);

    const repo = await connection.getRepo(repoId);

    return {
        connection: connection,
        server: server,
        repoId: repoId,
        repo: repo,
        //repos: repos
    }
}


export default function Repo() {
    const loaderData = useLoaderData() as RepoLoaderData;
    const server = loaderData.server;
    const photoTimeConnection = loaderData.connection;
    const repoId = loaderData.repoId;
    const repo = loaderData.repo;
    const navigate = useNavigate();

    //console.log(appstate.getLocation());

    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', maxHeight: '100vh'}}>
                <AppBar id="topbar" position="sticky" >
                    <h1 className='app-title'>PCR - {server.id}
                    </h1>
                </AppBar>
                <div className="page-body" style={{overflowY: 'auto', flex: 1}}>
                    <RepoItemList repo={repo} server={server} connection={photoTimeConnection}/>
                </div>
                <AppBar className="myfooter placeholder" id="footer-placeholder" position="fixed" sx={{position: "inherit", visibility: "hidden"}}>
                    <IconButton onClick={() => navigate(-1)}><BackIcon/></IconButton>
                    <div>{repo.info.label}</div>
                    <div>Repo Id: {repoId}</div>
                </AppBar>
                <AppBar className="myfooter" id="footer" position="static" >
                    <IconButton onClick={() => {appstate.back();navigate(-1);}}><BackIcon/></IconButton>
                    <div>{repo.info.label}</div>
                    <div>Repo Id: {repoId}</div>
                </AppBar>
            </div>
        </>
    );
}