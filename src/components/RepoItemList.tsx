import {Link as RouterLink, useLoaderData, Form } from 'react-router-dom';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Link from '@mui/material/Link';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import {appstate } from '../AppState';
import { serverInfo } from '../ServerDataSource';
import { PhotoTimeConnection } from '../api/PhototimeConnection';
import { NavItem } from '../AppLocation';

export interface RepoItemListProps
{
    repo: any;
    server: serverInfo;
    connection: PhotoTimeConnection;
}

export default function RepoItemList(props: RepoItemListProps)
{
    const repo = props.repo;
    const server = props.server;
    const cx = props.connection;

    const updateAppState = (item: NavItem) => {
        
        appstate.getLocation().parents.push(repo);
        appstate.setItem(item);
    }

    return (
        <>
        {
            repo?.items?.length? (
            <nav>
            <List className="mylist" >
            {
                repo.items.map((item: NavItem) => (
                
                <ListItem key={item.id} >
                    <Link className="repo-item"
                        underline="none"
                        onClick={()=> updateAppState(item)}
                        component={RouterLink} 
                        to={item.type=='folder'?
                            `/${server.id}/items?repoId=${encodeURIComponent(repo.info.id)}&itemId=${encodeURIComponent(item.id)}`
                            : `/${server.id}/itemView?repoId=${encodeURIComponent(repo.info.id)}&itemId=${encodeURIComponent(item.id)}}`
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