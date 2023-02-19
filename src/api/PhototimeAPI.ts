
import { PhotoTimeConnection } from './PhototimeConnection';
import { serverInfo } from '../ServerDataSource';

class PhototimeAPI 
{
	activeConnection: PhotoTimeConnection|undefined;

	connect(server: serverInfo): PhotoTimeConnection
	{
		this.activeConnection = new PhotoTimeConnection(server);
		return this.activeConnection;
	}

	getConnection() 
	{
		return this.activeConnection;
	}

	/*
	async deleteTag(itemId: string, tagValue: string)
	{
		return this.activeConnection?.deleteTag(itemId, tagValue);
	}

	async addTag(itemId: string, tagValue: string) 
	{
		return this.activeConnection?.addTag(itemId, tagValue);
	}
	*/
}

var gPhotoTimeAPI = new PhototimeAPI();

export { gPhotoTimeAPI }
