
export interface NavItem 
{
	id: string;
	type: "file"|"folder";
	label: string;
	thumb: string;
	items?: NavItem[];
	metadataLoaded?: boolean;
	metadata?: any;
	rating?: any;
	tags?: string[];
}

export class AppLocation
{
	serverId: string|undefined;
	repoId: string|undefined;
	//parents: NavItem[];
	parents: any[];
	item: NavItem|undefined|null;

	constructor() 
	{
		this.serverId = undefined;
		this.repoId = undefined;
		this.parents = [];
		this.item = undefined;
	}

	getItem() : NavItem|undefined|null 
	{
		return this.item;
	}
	
	setItem(item: NavItem|undefined|null) 
	{
		this.item= item;
	}
}