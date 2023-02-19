import React, {useEffect } from "react";

import { useLoaderData, useNavigate, useLocation } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import IconButton from '@mui/material/IconButton';  
import BackIcon from '@mui/icons-material/NavigateBefore';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import CropRoundedIcon from '@mui/icons-material/CropRounded';


import { gPhotoTimeAPI as photoTimeAPI} from '../api/PhototimeAPI';
import { gServers as servers, serverInfo } from '../ServerDataSource';
import { appstate } from '../AppState';
import { loadImage, constrainImage, Size } from '../components/ImageLoader';

import Cropper from "cropperjs";
import "/node_modules/cropperjs/dist/cropper.css";

import { RequestParamLoaderProps } from './RequestParamLoaderProps';
import { PhotoTimeConnection } from "../api/PhototimeConnection";
import { NavItem } from "../AppLocation";

type ItemEditLoaderData =
{
    connection: PhotoTimeConnection;
    server: serverInfo;
}

export async function loader( {request, params}: RequestParamLoaderProps ): Promise<ItemEditLoaderData>
{
    const url = new URL(request.url);
    const repoId=url.searchParams.get("repoId");
    //const itemId=url.searchParams.get("itemId");    

    if (!params.serverId)
        throw "no server id";

    console.log(params.serverId);
    console.log(`repoId=${repoId}`);

    const server = servers.getById(params.serverId);

    if (!server)
        throw "no server found";

    const connection = photoTimeAPI.connect(server);
    //const repo = await connection.getRepo(repoId);
    //const item = params.item;
    //const item=appstate.getLocation().item;
    // get item from appstate?
    return {
        //item: item, 
        connection: connection,
        server: server
    };
}

const defaultAspectWidth=16;
const defaultAspectHeight=9;

var lastCropEventDetail: any;
var cropper: Cropper;

var cropInfo = {
    aspectWidth: defaultAspectWidth,
    aspectHeight: defaultAspectHeight
};

export default function ItemEdit()
{
    const navigate = useNavigate();
    const loaderData = useLoaderData() as ItemEditLoaderData;
    const location = useLocation();
    const connection = loaderData.connection;
    const server = loaderData.server;

    const item = location?.state?.item;
    
	appstate.setItem(item);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [completedFirst, setCompletedFirst] = React.useState(false);

    const aspectRatioOpen = Boolean(anchorEl);

    const imageElementSelector = "#imageEdit";

    const handleCloseAspectRatio = (e: any) => {
        setAnchorEl(null);
    }
    const handleClickAspectRatio = (e: any) => {
        setAnchorEl(e.currentTarget);
    }

    const handleClickAspectRatioItem = (e: any) => {
        const aspectRatio = e.currentTarget.dataset.aspect;
        var aspectRatioNumber = 0;

        if (aspectRatio !='free') {
            var aspectWidth = aspectRatio.split('x')[0];
            var aspectHeight = aspectRatio.split('x')[1];
            cropInfo.aspectWidth = aspectWidth;
            cropInfo.aspectHeight = aspectHeight;

            aspectRatioNumber = parseInt(''+aspectWidth)/parseInt(''+aspectHeight);
        }

        if (!completedFirst)
        {
            // not sure why, but first time created on image load, unable to 
            // change the aspect ratio, but if recreate once, then are able to
            cropper.destroy();
            var image = document.querySelector(imageElementSelector) as HTMLImageElement;
        
            cropper = new Cropper(image, {
                aspectRatio: aspectRatioNumber,
                dragMode: 'move',
                crop(event) {
                    lastCropEventDetail = event.detail;
                }
            });
            setCompletedFirst(true);
        } else {
            cropper.setAspectRatio(aspectRatioNumber);
        }

        setAnchorEl(null);
    }

	const onImageLoaded = async (imageId: string, item: NavItem, containerSize: Size) => {
		constrainImage(imageId, containerSize).then((constrainedInfo) => {
            var image = document.querySelector(imageElementSelector) as HTMLImageElement;
    
            var aspectRatioNumber = parseInt(''+cropInfo.aspectWidth)/parseInt(''+cropInfo.aspectHeight);
    
            cropper = new Cropper(image, {
                aspectRatio: aspectRatioNumber/*defaultAspectWidth/defaultAspectHeight*/,
                dragMode: 'move',
                crop(event) {
                    /*
                    console.log(`crop event: 
                    x=${event.detail.x},y=${event.detail.y}
                    , WxH=${event.detail.width}x=${event.detail.height}
                    , rotate=${event.detail.rotate}
                    , scale=${event.detail.scaleX}x${event.detail.scaleY}
                    `);
                    */
                    lastCropEventDetail = event.detail;
                }
            });
            console.log(cropper);

		}, (reason) => {console.warn(reason);});
	}

    useEffect(() => {
        // useEffect is called twice in dev mode...
        // https://www.techiediaries.com/react-18-useeffect/
        loadImage("imageEditContainer", item, connection).then((val) => {
			onImageLoaded(val.imageId, item, val.containerSize);
		}, (reason) => {
			console.warn("failed to load image");
		});

		return () => {
			console.log('cleanup function');
		};
    }, []);

    const handleClickCrop = (e: any) => {

		var itemId = item.id;

        var cropParams = {
            'detail': lastCropEventDetail
            , 'aspectWidth': cropInfo.aspectWidth
            , 'aspectHeight': cropInfo.aspectHeight
        };
        connection.cropImage(itemId, cropParams).then((result)=> {
            // navigate back (and force reload?)
            // should force parent to reload or otherwise reinsert this new item into parent
            // also would prefer to navigate to this item
            // also also could consider in place edit option for repeated edits
            //app.goBack();
            console.log('completed crop');
            console.log(result);
            navigate(-1);
        }, (reason) => {
            console.log('crop failed');
            console.log(reason);
        });

    }


    return (
        <>
            <AppBar id="topbar" position="static" >
                <h1 className='app-title'>PCR - {server.id}</h1>
            </AppBar>
            <div className="page-body detail-image-page">
                <div id="imageEditContainer" className="fitImageContainer">
					<div id="imageEditHolder" className="fitImageHolder">
						<img id="imageEdit" className="fitImage"  src="" alt="the image to edit"/>
					</div>
				</div>
            </div>
            <Menu anchorEl={anchorEl} open={aspectRatioOpen} onClose={handleCloseAspectRatio}>
                <MenuItem data-aspect="free" onClick={handleClickAspectRatioItem}>free</MenuItem>
                <MenuItem data-aspect="5x7" onClick={handleClickAspectRatioItem}>5x7</MenuItem>
                <MenuItem data-aspect="4x6" onClick={handleClickAspectRatioItem}>4x6</MenuItem>
                <MenuItem data-aspect="7x5" onClick={handleClickAspectRatioItem}>7x5</MenuItem>
                <MenuItem data-aspect="6x4" onClick={handleClickAspectRatioItem}>6x4</MenuItem>
                <MenuItem data-aspect="8x10" onClick={handleClickAspectRatioItem}>8x10</MenuItem>
                <MenuItem data-aspect="10x8" onClick={handleClickAspectRatioItem}>10x8</MenuItem>
            </Menu>
			<AppBar className="myfooter placeholder" id="footer-placeholder" position="fixed" sx={{position: "inherit", visibility: "hidden"}}>
                    <IconButton onClick={() => navigate(-1)}><BackIcon/></IconButton>
			</AppBar>
            <AppBar className="myfooter" id="footer" position="static" >
                <IconButton onClick={() => navigate(-1)}><BackIcon/></IconButton>
                <IconButton onClick={(e) => handleClickAspectRatio(e)}><AspectRatioRoundedIcon/></IconButton>
                <IconButton onClick={(e) => handleClickCrop(e)}><CropRoundedIcon/></IconButton>
            </AppBar>
        </>
    )
}