import { AppLocation } from "./AppLocation";
import { FileNavigator } from "./FileNavigator";

class AppState
{

	location: AppLocation;

    constructor() {
		this.location = new AppLocation();
    }

	back() {
		var fileNavigator = new FileNavigator(this.getLocation());
		fileNavigator.back();
	}
    setServerId(serverId: string) {
        this.location.serverId = serverId;        
    }
    setRepoId(repoId: string) {
        this.location.repoId = repoId;
    }
    setItem(item: any) {
        this.location.setItem(item);
    }
    getItem() {
        return this.location.getItem();
    }

	getLocation() 
	{
        return this.location;
    }
    setLocation(location: AppLocation) {
        this.location = location;
    }
}

var gAppState = new AppState();

export { gAppState as appstate }
