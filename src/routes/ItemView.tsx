import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import BackIcon from '@mui/icons-material/NavigateBefore';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/AddCircleOutlineRounded';
import EditIcon from '@mui/icons-material/Edit';
import React, {useRef } from "react";
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

import Link from '@mui/material/Link';
import { Link as RouterLink, useLoaderData, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from "react";


import "./ItemView.css";
import { gPhotoTimeAPI as photoTimeAPI} from '../api/PhototimeAPI';
import { PhotoTimeConnection } from '../api/PhototimeConnection';
import { gServers as servers, serverInfo } from '../ServerDataSource';
import { appstate } from '../AppState';
import TagList from '../components/TagList';
import { constrainImage, loadImage } from "../components/ImageLoader";
import Swipeable, { SwipeDirection, OnSwipeInfo } from '../components/Swipeable';
import RatingPopup from '../components/RatingPopup';
import { ShowMixin } from "../components/ShowMixin";

import AddTagPopup from '../components/AddTagPopup';
import ButteredToast from '../components/ButteredToast';
import { ItemViewNavigator } from '../components/ItemViewNagivator';
import { NavItem } from '../AppLocation';
import { RequestParamLoaderProps } from './RequestParamLoaderProps';

import panzoom  from "panzoom";

async function loadMetadata(imgId: string, item: NavItem)
{
	var applocation = appstate.getLocation();
	if (!applocation.item || applocation.item.id !== item.id) {
		console.warn('app state is confused');
		return false;
	}

	if (!applocation.item.metadataLoaded) {
		var gConx = photoTimeAPI.getConnection();
		if (!gConx) throw "unabled to get connection";

		return gConx.loadMetadata(item.id).then((metadata) => {
			if (!applocation.item) throw "no item?";

			if (applocation.item.id === item.id) {
				if (metadata) {
					applocation.item.metadata = metadata;
					applocation.item.metadataLoaded = true;
					applocation.item.rating = metadata.Rating;
					applocation.item.tags = [];
					if (metadata.Keywords) {
						applocation.item.tags = metadata.Keywords.split(",");
					}

					//appstate.setLocation(applocation);
					//onMetadataUpdated();
					//return appstate;
					return true;
				}
			}
			return false;
		}).catch(reason => {
				console.warn('failed');
				console.warn(reason);
		});
	} else {
		//onMetadataUpdated();
		return false;;
	}
}

interface ItemViewLoaderData {
    connection: PhotoTimeConnection;
    //server: serverInfo,
	serverId: string;
	repoId: string;
    //repos: any;
}

export async function loader({request, params}: RequestParamLoaderProps) : Promise<ItemViewLoaderData> {
    const url = new URL(request.url);
    const repoId=url.searchParams.get("repoId");
    const itemId=url.searchParams.get("itemId");    

	if (!params.serverId) throw "no serverId provided";

    const server = servers.getById(params.serverId);
	if (!server || !server.id) throw "unable to find server";

	if (!repoId) throw "no repo id";
	
    const connection = photoTimeAPI.connect(server);
    //const repo = await connection.getRepo(repoId);
    //const item = params.item;
    //const item=appstate.getLocation().item;
    // get item from appstate?
    return {
        //item: item, 
        connection: connection,
		serverId: server.id,
		repoId: repoId
    };
}


export default function ItemView() {
    const navigate = useNavigate();
    const loaderData = useLoaderData() as ItemViewLoaderData;
    const location = useLocation();
    const connection = loaderData.connection;
    //const item = location?.state?.item;

	const item = appstate.getItem();
	// state might have item, but just use item id and app state

    const [tags, setTags] = React.useState<string[]>(item?.tags?item.tags:[]);
	const [rating, setRating ] = React.useState<string|number>(item?item.rating:"");

	// what to do if location is not set?
	// if have parameters in url, then could set it
	// but these particular parameters in the url are ugly
	// wait until decide whether to cleanup the ids in use
	const [curItem, setCurItem ] = React.useState(item);

	// sync'ing app state?
	//appstate.setItem(curItem);

	//appstate.setServerId(location.state.serverId);
	//appstate.setRepoId(location.state.repoId);
	appstate.setServerId(loaderData.serverId);
	appstate.setRepoId(loaderData.repoId);


	const ratingPopupRef=useRef<ShowMixin>(null);
	const addTagPopupRef=useRef<ShowMixin>(null);
	const butteredToastRef=useRef<ShowMixin>(null);

	const updateViewForNewItem = () => {
		const item = appstate.getLocation().getItem();
		if (!item) {
			console.warn("no item available");
			return;
		}
		const serverId= appstate.getLocation().serverId;
		const repoId=appstate.getLocation().repoId;
		if (!repoId) {
			console.warn("no repo");
			return;
		}

		const to=item.type=='folder'?
		`/${serverId}/items?repoId=${encodeURIComponent(repoId)}&itemId=${encodeURIComponent(item.id)}`
		: `/${serverId}/itemView?repoId=${encodeURIComponent(repoId)}&itemId=${encodeURIComponent(item.id)}}`;

		setCurItem(item);
		navigate(to, {replace:true, state:item} );
	}

	const itemViewNagivator = new ItemViewNavigator(updateViewForNewItem);

	const onImageLoaded = async (imageId: string, item:NavItem, containerSize:any) => {
		constrainImage(imageId, containerSize).then((constrainedInfo) => {
			
			var img: any = document.querySelector("#"+imageId+" img");
			if (!img) {
				// maybe navigated away
				return;
			}
			
			img.style.display='none';
			var cnv:any = document.getElementById('detail-image-canvas');
			var ctx = cnv.getContext("2d");
			
			var usew = constrainedInfo.usew;
			var useh = constrainedInfo.useh;

			cnv.width = usew;
			cnv.height= useh;
	
			// destination x, destination y, destination width, destination height
			ctx.drawImage(img, 0, 0, usew, useh);
			cnv.style.display='block';
			panzoom(cnv);

		}, (reason) => {console.warn(reason);});

		loadMetadata(imageId, item).then( (wasLoaded) => {
			const loadedTags = appstate.getItem()?.tags;
			if (loadedTags) {
				//console.debug(loadedTags);
				setTags(loadedTags);
			}
			const loadedRating = appstate.getItem()?.rating;
			if (typeof loadedRating=="number" || typeof loadedRating =="string") {
				//console.debug(`loaded rating=${loadedRating}`);
				setCurItem(item);
				setRating(loadedRating);
			} else {
				setRating("");
			}
		}, (reason) => {
			console.warn(reason);
		});
	}

	
	const handleRateItemClicked = async function (clickedRating: string|number) {
		if (!item)
			return;

		connection.rateItem(item.id, clickedRating).then(() => {
			const curItem = appstate.getItem();
			if (item.id == curItem?.id) {

				item.rating = clickedRating;
				if (item.metadataLoaded && item.metadata) {
					item.metadata.Rating = clickedRating;					
				}
			}
			// putting toast state change at bottom to force render after changing item data
			setRating(item.rating);
			if (butteredToastRef.current != null)
					butteredToastRef.current.show(`Photo rated a ${item.rating}`);
		}).catch ((reason) => {
			console.warn('drat, rating failed');
		});
	}
	const handleRatingClicked =  () => {
		if (ratingPopupRef.current)
			ratingPopupRef.current.show();
	}
	const goBack = () => {
		itemViewNagivator.goBack();
		navigate(-1);
	};
	const handleDeleteClicked = async function() {
		if (!item)
			return;
		
		await connection.deleteItem(item.id).then(() => {
			// back or "next"?
			itemViewNagivator.gotoNext();
			//goBack();
		});
	}
	const handleTagDelete = async function (tagValue: string) {
		if (!item)
		{
			return;
		}

		await connection.deleteTag(item.id, tagValue).then((res) => {
			// done deleting tag
			// now update ui and metadata..
			const curItem = appstate.getItem();

			// check that state matches (item comes from location..)
			if (curItem?.id === item?.id && curItem?.tags) 
			{
				// using slice so that setTags will notice a different reference object and re-render
				const curTags = curItem.tags.slice();
				console.log(`looking for tag to delete: ${tagValue}`);
				for (let tagIdx =0; tagIdx< curTags.length; ++tagIdx) {
					if (curTags[tagIdx] === tagValue) {
						//update tags on item too
						curTags.splice(tagIdx, 1);
						curItem.tags = curTags;
						setTags(curTags);
						setCurItem(curItem);
						break;
					}
				}
			} else {
				console.log(`unable to delete tags, curItem.id=${curItem?.id}, item.id=${item.id}`);
			}
		}, (reason) => {
			console.warn(reason);
		});

	}

	const handleAddTagSubmit = async function (tag: string) {
		if (!item)
			return;

		await connection.addTag(item.id, tag);
		
		// done adding tag
		// now update ui and metadata..
		//if (applocation.item.id === appstate.getLocation().item.id) 
		{
			const appStateItem = appstate.getItem();
			if (appStateItem && appStateItem.tags) {
				appStateItem.tags.push(tag);
				setTags(appStateItem.tags.slice());
			}

		}
	};

	// 
    useEffect(() => {
		if (curItem) {
			var cnv = document.getElementById('detail-image-canvas');
			if (cnv) {
				cnv.style.display='none';
			
				loadImage("detailImageContainer", curItem, connection).then((val) => {
					onImageLoaded(val.imageId, curItem, val.containerSize);
				}, (reason) => {
					console.warn("failed to load image");
				});
			}
		}		
		return () => {
			//console.log('react effect cleanup function');
		};
    }, [curItem]);
	const addTag = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (addTagPopupRef.current !== null)
			addTagPopupRef.current.show();
	}

	const handleSwipe = (swipeInfo: OnSwipeInfo) => 
	{
		if (swipeInfo.direction == SwipeDirection.LEFT) {
			itemViewNagivator.gotoNext();
		} else if (swipeInfo.direction == SwipeDirection.RIGHT) {
			itemViewNagivator.gotoPrevious();
		}
	}

    return (
        <>
            <AppBar id="topbar" position="static" className="myheader">
                <h1 className='app-title'>PCR</h1>
            </AppBar>
            <div className="page-body detail-image-page detail-item-content" >
            {
                curItem?(
                    <>
                    <div className='detailImageContainer' id="detailImageContainer" >
                        <div className="fitImageHolder">
                            <img className="fitImage" alt="image detail" src="" />
                            <canvas id="detail-image-canvas" style={{display: "none"}}></canvas>
                        </div>
						<div className="detailImageHUD">
							<div className="detailImageLabel">
								<div>{curItem.label}</div>
							</div>
							<div className="detailImageRating" >
								<StarIcon data-rating="1" className={''+rating >= '1'?"hud-imageRating active-rating":"hud-imageRating"}></StarIcon>
								<StarIcon data-rating="2" className={''+rating >= '2'?"hud-imageRating active-rating":"hud-imageRating"}></StarIcon>
								<StarIcon data-rating="3" className={''+rating >= '3'?"hud-imageRating active-rating":"hud-imageRating"}></StarIcon>
								<StarIcon data-rating="4" className={''+rating >= '4'?"hud-imageRating active-rating":"hud-imageRating"}></StarIcon>
								<StarIcon data-rating="5" className={''+rating >= '5'?"hud-imageRating active-rating":"hud-imageRating"}></StarIcon>
							</div>
						</div>
						<div className="itemViewMetaDataHUD">
							{/* todo: make into component TagsWidget */}
							<div style={{display:'flex',alignItems:'center'}}>
								<div style={{flex:1,marginRight: '0.5em'}}>Tags</div>
								<IconButton onClick={(e)=> {addTag(e)}}><AddIcon  /></IconButton>
							</div>
							<TagList id="itemViewTagsList" tags={tags} handleTagDelete={handleTagDelete}/>
						</div>
						<>
							<AddTagPopup ref={addTagPopupRef} onSubmit={handleAddTagSubmit}/>
						</>
						<>
						 <RatingPopup ref={ratingPopupRef} item={curItem} onItemRated={handleRateItemClicked}/>
						</>
                    </div>
                    </>
                ) :
                (
                    <>empty image</>
                )
            }
            </div>
			<ButteredToast ref={butteredToastRef} />
			<AppBar className="myfooter placeholder" id="footer-placeholder" position="fixed" sx={{position: "inherit", visibility: "hidden"}}>
                    <IconButton onClick={() => goBack()}><BackIcon/></IconButton>
			</AppBar>
            <AppBar className="myfooter" id="footer" position="static" >
                <IconButton onClick={() => goBack()}><BackIcon/></IconButton>
                <IconButton onClick={() => handleRatingClicked()}><StarIcon style={{color:''}}/></IconButton>
				<IconButton onClick={() => itemViewNagivator.gotoPrevious()}><ArrowBackRoundedIcon /></IconButton>
				<IconButton onClick={() => itemViewNagivator.gotoNext()}><ArrowForwardRoundedIcon /></IconButton>
				{ curItem?(
					<IconButton ><Link className="repo-item" underline="none" 
					component={RouterLink} 
					to={`/${loaderData.serverId}/itemEdit?repoId=${encodeURIComponent(loaderData.repoId)}&itemId=${encodeURIComponent(curItem.id)}`
					}
					state={{item: curItem}}
					>
					<EditIcon style={{color:''}}/>
					</Link>
					</IconButton>
				):(<IconButton >
					<EditIcon style={{color:''}}/>
					</IconButton>)
				}
				<Swipeable onSwipe={handleSwipe}>Swipe Navigation Bar</Swipeable>
				<IconButton className="deleteItem" style={{position:'absolute',right:'6pt'}} onClick={() => handleDeleteClicked()}><DeleteRoundedIcon/></IconButton>
            </AppBar>

        </>
    );
}