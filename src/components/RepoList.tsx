import {Link as RouterLink, useLoaderData, Form } from 'react-router-dom';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Link from '@mui/material/Link';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { serverInfo } from '../ServerDataSource';

interface RepoListProps
{
    repos: any[],
    server: serverInfo,
    cx: any
}

export default function RepoList({repos, server, cx}: RepoListProps)
{
    //const repos = props.repos;
    //const server = props.server;
    //const cx = props.connection;

    const isNav = true;
    return (
        <>
        {
            repos?.length ? (
            <nav>
            <List className="mylist">
            {repos.map((repo) => (
            <ListItem key={repo.id} >
                <Link className="repo-item" underline="none" component={RouterLink} to={`/${server.id}/repo?repoId=${encodeURIComponent(repo.id)}`}>
                    <div className='item-thumb'>
                        <img className="item-thumb" src={cx.getThumbUrl(repo.thumb)}/>
                    </div>
                    <div className='item-label'>
                        {repo.label}
                    </div>
                </Link>
                <KeyboardArrowRightIcon/>                
            </ListItem>
            ))}
            </List>
            </nav>
    
            ):(
            <>Nothing</>
            )
        }
 
        </>
    );
}