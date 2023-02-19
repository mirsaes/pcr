import { AppLocation, NavItem } from './AppLocation';


export interface NavInfo {
	popCount: number;
	item: NavItem|null|undefined;
	ancestorSibling: NavItem;
}

export interface AdjItemInfo {
	prev: NavItem;
	next: NavItem;
	idx: number;
}

export class FileNavigator
{
	applocation: AppLocation;
	
	constructor(appLocation: AppLocation) {
		this.applocation = appLocation;
	}

	getLocation() : AppLocation {
		return this.applocation;
	}

	/**
	 * Navigate "back"
	 * 	really more of a "up"
	 */
    back() {
		var applocation = this.getLocation();

		// pop parent
		if (applocation.parents.length == 0) {
			if (applocation.item) {
				applocation.item = undefined;
			}
			else if (applocation.repoId) {
				applocation.repoId=undefined;
			} else {
                //applocation.repoId=undefined;
				applocation.serverId = undefined;
			}
		} else {
			// within repo still
			var group = applocation.parents.pop();
			applocation.item = group;
		}
    }

	/**
	 * get the next or previous item traversing directories if necessary
	 * @param {*} item - the current item, might be null if current location is a folder
	 * @param {*} nextOrPrev -> 'next' | 'prev'
	 * @returns 
	 * 
	 * note: some oddity in usage semantics with location vs item
	 */
	getNav(item: NavItem, nextOrPrev: "next"|"prev") : NavInfo {
		var navInfo: NavInfo = {} as NavInfo;
		var applocation = this.getLocation();
		
		var adjSiblings: AdjItemInfo = this.getItemsAdjSiblings(item);
		if (adjSiblings[nextOrPrev]) {
			navInfo.popCount = 0;
			navInfo.item = adjSiblings[nextOrPrev];
			return navInfo;
		}

		// if no prev or next go to parent and look at siblings
		// put ancestors in order of parent, grandparent, greatgrandparent
		// start with grandparent
		var ancestors = [];
		for (let ancestorIdx = applocation.parents.length-2; ancestorIdx >=0; ancestorIdx--)
		{
			ancestors.push(applocation.parents[ancestorIdx]);
		}

		// scenarios..
		// last item in folder, folder has item siblings
		// empty folder (item is null) and siblings of parent (folder) are folders
			
		var lastParent = applocation.parents[applocation.parents.length-1];

		for (let ancestorIdx = 0; ancestorIdx < ancestors.length; ++ancestorIdx) {
			let ancestor = ancestors[ancestorIdx];
			var adjItems: AdjItemInfo = this.getAdjItems(ancestor.items, lastParent);
			
			if (adjItems[nextOrPrev]) {
				navInfo.popCount = ancestorIdx+1;
				navInfo.ancestorSibling = adjItems[nextOrPrev];
				break;
			} else {
				lastParent = ancestor;
			}
		}		
		if (ancestors.length == 0) {
			console.warn("TODO: need to know that the parent of the item folder is a itemlist from a repo");
		}
		return navInfo;
	}

    // get "next" items, traversing folders as necessary
    // @param item - the current item (same as appLocation?) if null, looking at empty folder
	// {nextPopCount: 1, nextParent, item: the next item}
	// {nextPopCount: 1, parentsNextSibling, item: the next item}
	getNextNav(item: NavItem) : NavInfo
	{
		return this.getNav(item, 'next');
	}

    // get "prev" items, traversing folders as necessary
    // 
	// {prevPopCount: 1, prevParent, item: thePreviousItem}
	// {prevPopCount: 1, parentsPrevSibling, item: thePreviousItem}
	getPrevNav(item: NavItem): NavInfo
	{
		return this.getNav(item, 'prev');
	}
	// search through items and find the previous and next sibling for item
	// {prev: item, next: item, idx: itemsIdx}
	getAdjItems(items: NavItem[], item: NavItem): AdjItemInfo
	{
		var adjItems: AdjItemInfo = {} as AdjItemInfo;
		var idx;
		for (idx = 0; idx < items.length; ++idx)
		{
			let aitem = items[idx];
			if (aitem.id == item.id) {
				if (idx > 0)
					adjItems.prev = items[idx-1];
				if (idx + 1 < items.length)
					adjItems.next = items[idx+1];
				
				adjItems.idx = idx;
				break;
			}
		}
		
		return adjItems;
	}

	// using the locations item and parent, find the item's siblings
	// will not traverse beyond its parent
    // @return {prev: item, next: item, idx: itemsIndex}
	// may be undefined prev, next
	getAdjSiblings(): AdjItemInfo
    {
        var applocation = this.getLocation();
        var item = applocation.item;
        return this.getItemsAdjSiblings(item);
    }

	// using current location parent, find the items prev, next siblings
	// will not traverse beyond its parent
	// @return {prev: item, next: item, idx: itemsIndex}
	// may be undefined prev, next
	getItemsAdjSiblings(item: any): AdjItemInfo
	{
		// find item id in parent
		var applocation = this.getLocation();
		var parent = applocation.parents[applocation.parents.length-1];
		var items = parent.items;
		
		return this.getAdjItems(items, item);
	}    
}