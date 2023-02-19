import {Link as RouterLink, useLoaderData, Form } from 'react-router-dom';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Link from '@mui/material/Link';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { appstate } from '../AppState';
import { serverInfo } from '../ServerDataSource';
import { NavItem } from '../AppLocation';
import { PhotoTimeConnection } from '../api/PhototimeConnection';

interface ItemListProps 
{
    repoId: string;
    server: serverInfo;
    item: NavItem;
    connection: PhotoTimeConnection;
}

export default function ItemList(props: ItemListProps)
{
    const repoId = props.repoId;
    const server = props.server;
    const item = props.item;
    const cx = props.connection;

    const updateAppState = (navToItem: NavItem) => {
        appstate.getLocation().parents.push(item);
        appstate.setItem(navToItem);

        //console.log(appstate.getLocation());
    }
    
    return (
        <>
        {
            item?.items?.length? (
            <nav>
            <List className="mylist" style={{maxHeight:'100vh'}}>
            {
                item.items.map((item) => (
                
                <ListItem key={item.id}>
                    <Link className="repo-item" underline="none" 
                        onClick={()=>updateAppState(item)}
                        component={RouterLink} 
                        to={item.type=='folder'?
                            `/${server.id}/items?repoId=${encodeURIComponent(repoId)}&itemId=${encodeURIComponent(item.id)}`
                            : `/${server.id}/itemView?repoId=${encodeURIComponent(repoId)}&itemId=${encodeURIComponent(item.id)}}`
                        }
                        state={{item: item}}

                        >
                        <div className='item-thumb'>
                            <img className="item-thumb" src={cx.getThumbUrl(item.thumb)}/>
                        </div>
                        <div className='item-label'>
                            {item.label}
                        </div>
                    </Link>
                    <KeyboardArrowRightIcon/>                
                </ListItem>
                ))
            }
            </List>
            </nav>
    
            ) : (
            <>Nothing</>
            )
        }
        </>
    );
}