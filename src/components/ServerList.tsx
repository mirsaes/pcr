import {Link as RouterLink, useLoaderData, Form } from 'react-router-dom';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Link from '@mui/material/Link';

import DeleteIcon from '@mui/icons-material/Delete';
import { SvgIconComponent } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';  
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { serverInfo } from '../ServerDataSource';

interface ServerListProps {
    servers: serverInfo[],
    isNav: boolean,
    onAction?: (serverId:string) => void
}

export default function ServerList(props: ServerListProps)
{
    const servers = props.servers;
    const isNav = props.isNav;
    const handleAction = props.onAction;
    const handleDelete = (serverId: string|undefined) => 
    {
        console.log(`delete called: ${serverId}`);
        if (handleAction && typeof serverId!="undefined") 
        {
            handleAction(serverId);
        }
    }

    return (
        <nav>
        <List className="mylist">
        {servers.map((server: serverInfo) => (
        <ListItem key={server.id} >
            <Link underline="none" component={isNav?RouterLink:"a"} to={`${server.id}/repos`}>
                <div>Host: {server.host}</div>
                <div>Port: {server.port}</div>
            </Link>
            {isNav?
            (<KeyboardArrowRightIcon/>) : (
                
                <IconButton onClick={() => { handleDelete(server.id);}}><DeleteIcon fontSize="large"/></IconButton>
                )
            }
            
        </ListItem>
        ))}
        </List>
        </nav>
    );
}
