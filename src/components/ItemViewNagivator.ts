import { appstate } from '../AppState';
import { AppLocation, NavItem } from '../AppLocation';

import { FileNavigator, NavInfo, AdjItemInfo } from '../FileNavigator';
import { gPhotoTimeAPI as photoTimeAPI} from '../api/PhototimeAPI';
import { FetchedItem } from '../api/PhototimeConnection';

interface DirectionContext {
	getNextOrPrev: (item: NavItem) => NavInfo;
	updateNavFn: (adjNav: NavInfo, items: NavItem[]) => void;
	siblingItem: NavItem;
	useFirst: boolean;
}


/**
 *  A depth first tree navigator, needs refactoring and formalizing
 */
export class ItemViewNavigator
{
	updateViewForNewItem: () => void;
	fileNavigator: FileNavigator;

	constructor(onItemChangedFn: () => void) {
		this.updateViewForNewItem = onItemChangedFn;
		this.fileNavigator = new FileNavigator(appstate.getLocation());
	}
	goBack()
	{
		this.fileNavigator.back();
	}

	fetchItems = async (itemId: string): Promise<FetchedItem> =>  {
		let gConx = photoTimeAPI.getConnection();
		if (!gConx) throw "unable to get connection";
		let loadedItem = await gConx.getItems(itemId);
		return loadedItem;
	}

	processNextOrPrevFinding = async (adjNav: NavInfo, applocation: AppLocation, directionContext: DirectionContext) => {
		if (adjNav.item && adjNav.popCount == 0) {
			// "next" available
			if (adjNav.item.type == 'file') {
				console.warn('Does this work?');
			} else {
				// folder
				applocation.item = adjNav.item;
				if (!adjNav.item.items) {
					// ajax to get items, then proceed
					let loadedItem = await this.fetchItems(adjNav.item.id);
					if (adjNav.item.id == loadedItem.info.id) {
						adjNav.item.items = loadedItem.items;
					}
				}
				if (!adjNav.item.items) {
					throw "folder has no items created?";
				}

				if (adjNav.item.items.length == 0) {
					// if empty
					console.warn("TODO: try to find non-empty sibling blah");
				} else {
					// if not empty
					// but first might be a folder, etc, need to recurse
					applocation.item = adjNav.item.items[directionContext.useFirst?0:adjNav.item.items.length-1];
					applocation.parents.push(adjNav.item);
					this.updateViewForNewItem();
				}
			}
		}
		else if (adjNav.ancestorSibling && adjNav.popCount > 0) {
			// "next" sibling of some parent
			if (adjNav.item) {
				if (adjNav.item.type == 'file') {
					// set next item (should be file)
					// and update to appropriate "new" parent
					applocation.item = adjNav.item;
					
					var popIdx;
					for (popIdx = 0; popIdx < adjNav.popCount; ++popIdx) {
						applocation.parents.pop();
					}
					// assuming this is a folder
					applocation.parents.push(adjNav.ancestorSibling);
				} else {
					// its a folder, might be empty etc
					console.debug(adjNav.item);
				}
				this.updateViewForNewItem();
			} else if (adjNav.ancestorSibling.type == 'file') {
				// set the item
				applocation.item = adjNav.ancestorSibling;
				// remove parents until sibling's parent is on stack
				var popIdx;
				for (popIdx = 0; popIdx < adjNav.popCount; ++popIdx) {
					applocation.parents.pop();
				}
				// no need to push the ancestorSibling, since it is a an item, not a parent
				// turn off loading
				this.updateViewForNewItem();
			} else if (!adjNav.ancestorSibling.items){
				// ancestorSibling is a folder but haven't loaded items yet..
				var gConx = photoTimeAPI.getConnection();
				if (!gConx) throw "unable to get connection";

				let loadedItem = await gConx.getItems(adjNav.ancestorSibling.id);

				var jData = loadedItem;
				// next could either be in a sibling folder
				// or have to use its parent folder..

				// if jData.items.length == 0, this is empty folder
				// so ... continue searching? unless last item?
				if (jData.items.length == 0) {
					for (let popIdx=0; popIdx < adjNav.popCount; ++popIdx) {
						applocation.parents.pop();
					}

					const emptyFolderItem: NavItem = {type:"folder", ... jData.info};
					emptyFolderItem.items=jData.items;
					// update navstate, but then continue searching..
					//directionContext.updateNavFn(adjNav, )
					// todo should update parents, item info so it has empty items, items=[];							
					applocation.item = emptyFolderItem;
					// don't need to pop parents state, have already done that
					let emptyFolderAdjNav = directionContext.getNextOrPrev(emptyFolderItem);
					this.processNextOrPrevFinding(emptyFolderAdjNav, applocation, directionContext);
				} else {
					directionContext.updateNavFn(adjNav, jData.items);
					// turn off loading
					this.updateViewForNewItem();
				}
			} else {
				directionContext.updateNavFn(adjNav, adjNav.ancestorSibling.items);
				// turn off loading
				this.updateViewForNewItem();
			}
		}
	}
	processNavRequest = async (directionContext: DirectionContext) => {
		const applocation = appstate.getLocation();

		if (directionContext.siblingItem) {
			// have a sibling (file or folder)
			if (directionContext.siblingItem.type == 'file') {
				applocation.setItem(directionContext.siblingItem);
				this.updateViewForNewItem();
			} else {
				// its a folder
				if (!directionContext.siblingItem.items) {
					// items not loaded so need to load
					console.debug('navigating and items not loaded so need to load');
					var gConx = photoTimeAPI.getConnection();
					if (!gConx) throw "unable to get connection";

					let loadedItem = await gConx.getItems(directionContext.siblingItem.id);
					var jData = loadedItem;

					if (jData.items && jData.items.length) {
						// items now loaded, so...
						directionContext.siblingItem.items = jData.items;
					}
				}

				if (directionContext.siblingItem.items) {
					// items already (or now) loaded, so
					applocation.item = directionContext.siblingItem.items[directionContext.useFirst?0:directionContext.siblingItem.items.length-1];
					applocation.parents.push(directionContext.siblingItem);
					this.updateViewForNewItem();
				} else {
					// just show it as an item
					applocation.item = directionContext.siblingItem;
					this.updateViewForNewItem();
				}
			}

			return;
		}

		// no more siblings, try to go to parent's sibling's next item
		// the parent's sibling might be "empty", so repeat as needed
		//if no applocation.item.., that means empty folder and trying to go next
		if (!applocation.item) {
			// parent is the folder being examined, so go up and to next sibling
			// if no next sibling, repeat up and to next sibling
			console.log(`test fixme, go to parent's "next" sibling`);
			console.log(applocation);
		}
		if (applocation.item) {
			var adjNav = directionContext.getNextOrPrev(applocation.item);
			this.processNextOrPrevFinding(adjNav, applocation, directionContext);
		}
	}

	gotoPrevious = async () => {
		// get Adjacent siblings based on current
		const siblingInfo = this.fileNavigator.getAdjSiblings();

		const directionContext: DirectionContext = {} as DirectionContext;
		
		directionContext.getNextOrPrev = this.fileNavigator.getPrevNav.bind(this.fileNavigator);
		directionContext.updateNavFn = (adjNav: NavInfo, items: NavItem[]) => { this.updateNavState(adjNav, items, false)};
		directionContext.siblingItem = siblingInfo.prev;
		directionContext.useFirst = false;

		this.processNavRequest(directionContext);
	}


	// is first -> next..
	updateNavState = (adjNav: NavInfo, items: NavItem[], isFirst: boolean) => {
		// was itemViewPage.updateNavToParent

		var applocation = appstate.getLocation();
		applocation.item = null;
		adjNav.ancestorSibling.items = items;
		
		var popIdx;
		for (popIdx = 0; popIdx < adjNav.popCount; ++popIdx) {
			applocation.parents.pop();
		}
		
		applocation.parents.push(adjNav.ancestorSibling);
		var itemIdx = (isFirst?0:adjNav.ancestorSibling.items.length-1);
		applocation.item = adjNav.ancestorSibling.items[itemIdx];		
	}
	
	gotoNext = async () => {
		// get Adjacent siblings based on current
		const siblingInfo = this.fileNavigator.getAdjSiblings();

		const directionContext: DirectionContext = {} as DirectionContext;
		
		directionContext.getNextOrPrev = this.fileNavigator.getNextNav.bind(this.fileNavigator);
		directionContext.updateNavFn = (adjNav, items) => { this.updateNavState(adjNav, items, true)};
		directionContext.siblingItem = siblingInfo.next;
		directionContext.useFirst = true;

		this.processNavRequest(directionContext);

		/*
		directionContext.getNextOrPrev = jQuery.proxy(appstate.getNextNav, appstate);
		directionContext.updateNavFn = itemViewPage.updateToNext;
		directionContext.siblingItem = adjSiblings.next;
		directionContext.useFirst = true;

		on load of re

		server (repos) -> repo (items) -> item [file|folder] ->(folder) items

		server
		repoa   repob
		         /     \       \
			  item1   item2   item3


		location
			server, repo, item, parents[]
		*/
	}	
}