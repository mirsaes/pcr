import { useLoaderData, useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';  
import BackIcon from '@mui/icons-material/NavigateBefore';

import { gPhotoTimeAPI as photoTimeAPI} from '../api/PhototimeAPI';
import { gServers as servers, serverInfo } from '../ServerDataSource';
import ItemList from "../components/ItemList";
import { Poller } from "../components/Poller";
import { StatusCheck } from "../components/StatusCheck";
import { appstate } from '../AppState';
import {RequestParamLoaderProps } from './RequestParamLoaderProps';
import { NavItem } from '../AppLocation';
import { PhotoTimeConnection } from '../api/PhototimeConnection';

type ItemsLoaderData = 
{
    connection: PhotoTimeConnection;
    server: serverInfo;
    repoId: string;
    itemId: string;
    item: NavItem;
}

export async function loader( {request, params}: RequestParamLoaderProps ) : Promise<ItemsLoaderData>
{
    const url = new URL(request.url);
    const repoId=url.searchParams.get("repoId");
    const itemId=url.searchParams.get("itemId");

    //console.log(`serfverId=${params.serverId}`);
    //console.log(`repoId=${repoId}`);
    if (!repoId)
        throw "no repo id available";

    if (!itemId)
        throw "no item id available";
    

    if (!params.serverId)
        throw "no server id specified";

    const server = servers.getById(params.serverId);

    if (!server)
        throw "no server found";

    const connection = photoTimeAPI.connect(server);
    //const repo = await connection.getRepo(repoId);
    var loadedItem = await connection.getItems(itemId);
    var item: NavItem;

    if (appstate.getItem()?.id != loadedItem.info.id) {
        console.warn('huh');
        console.log(loadedItem);
        console.log(appstate.getItem());
        // update appstate as we now have items for the item
        const itemOverwrite = loadedItem.info as NavItem;
        itemOverwrite.items = loadedItem.items;
        item=itemOverwrite;
    }
    else {
        const stateItem = appstate.getItem();
        if (!stateItem)
            throw "no item in app state, huh?";

        stateItem.items = loadedItem.items;
        appstate.setItem(stateItem);
        item=stateItem;
    }

    return {
        connection: connection,
        server: server,
        repoId: repoId,
        itemId: itemId,
        item: item
    }
}

export default function Items()
{
    const loaderData = useLoaderData() as ItemsLoaderData;
    const server = loaderData.server;
    const photoTimeConnection = loaderData.connection;
    const repoId = loaderData.repoId;
    const item = loaderData.item;

    const navigate = useNavigate();

    const goBack = () => {
        appstate.back();
        navigate(-1);
    }
    
    return (
        <>
        <div style={{display: 'flex', flexDirection: 'column', maxHeight: '100vh'}}>
            <AppBar id="topbar" position="static" >
                <h1 className='app-title'>PCR - {server.id}
                </h1>
            </AppBar>
            <div className="page-body" style={{overflowY: 'auto', flex: 1}}>
                <ItemList server={server} repoId={repoId} item={item} connection={photoTimeConnection}/>
            </div>
            <AppBar className="myfooter placeholder" id="footer-placeholder" position="fixed" sx={{position: "inherit", visibility: "hidden"}}>
                <IconButton onClick={() => navigate(-1)}><BackIcon/></IconButton>
            </AppBar>
            <AppBar className="myfooter" id="footer" position="static" >
                <IconButton onClick={goBack}><BackIcon/></IconButton>
                <StatusCheck/>
            </AppBar>
        </div>
        </>
    )
}