import {serverInfo } from '../ServerDataSource';


type HttpMethod = "POST"|"GET"|"PUT"|"DELETE";

export interface CropDetails 
{
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface CropParams
{
	detail: CropDetails;
	aspectWidth: number;
	aspectHeight: number;	
}

/**
 * requesting an item info will include basic information
 */
export interface AnyItemInfo 
{
	id: string;
	label: string;
	thumb: string;
}

export interface FetchedItemInfo extends AnyItemInfo
{
}

export interface FetchedItemChild extends AnyItemInfo
{
	type: "folder"|"file";
}

export interface FetchedItem
{
	info: FetchedItemInfo;
	items: FetchedItemChild[];
}

export interface Repo extends AnyItemInfo 
{
}

async function jsonCall(url: string, jsonObject:object|undefined|null, method: HttpMethod)
{
	const options: RequestInit = {
		method:method,
		mode:'cors',
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	};
	if (jsonObject) {
		options.body = JSON.stringify(jsonObject);
	}

	return fetch(url, options).then((response) => {
		return response.json();
	});
}

async function jsonGet(url: string) 
{
	return jsonCall(url, null, "GET");
}

async function jsonPost(url: string, jsonObject: object)
{
	return fetch(url, {
		method:"POST",
		mode:'cors',
		body: JSON.stringify(jsonObject),
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	}).then((response) => {
		return response.json();
	});
}


class PhotoTimeConnection
{
	server: serverInfo;
	urlRoot: string;

	constructor(server: serverInfo) {
		this.server = server;
		this.urlRoot = `${server.scheme?server.scheme:'http'}://${this.server.host}:${this.server.port}`;	
	}

	async getRepo(repoId: string) : Promise<FetchedItem> {
		var url = `${this.urlRoot}/repo/${repoId}`;
		return fetch(url, {'mode':'cors'})
		.then((response) => {
			return response.json()
		}).then((data ) => {
			return data;
		})
	}

	getServerUrl(): string
	{
		return this.urlRoot;
	}

	getThumbUrl(thumb: string): string
	{
		var thumbUrl = this.getServerUrl() + thumb
		return thumbUrl.replace(/\\/g, "/");
	}
	
	async getRepos() : Promise<Repo[]>{
		const url = `${this.urlRoot}/repos`;
		return fetch(url, {'mode':'cors'})
		.then((response) => {
			return response.json()
		});
	}

	async getItems(itemId: string) : Promise<FetchedItem> {
		const url = `${this.urlRoot}/item/${itemId}`;
		return fetch(url, {'mode':'cors'})
		.then((response) => {
			return response.json()
		});
	}

	async deleteItem(itemId: string) {
		const url = `${this.urlRoot}/item/${itemId}`;
		fetch(url, {
			method: "DELETE"
		});
	}

	async loadMetadata(itemId: string) {
		var url = `${this.urlRoot}/metadata/${itemId}`;
		return fetch(url, {'mode':'cors'})
		.then((response) => {
			return response.json();
		});
	}

	async addTag(itemId:string, tagValue: string)
	{
		const url = `${this.urlRoot}/metadata/${itemId}`;
		try {
			return fetch(url, {
				method:"POST",
				mode:'cors',
				body: JSON.stringify({"tags":[tagValue]}),
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				}				
			}).then((response) => {
				return response.json();
			});
		} catch (error) {
			throw error;
		}
	}
	
	async deleteTag(itemId: string, tagValue: string)
	{
		const url = `${this.urlRoot}/metadata/${itemId}`;
		try {
			return fetch(url, {
				method:"DELETE",
				mode: 'cors',
				body: JSON.stringify({"tags":[tagValue]}),
				headers: {
					'Content-Type':"application/json; charset=utf-8"
				}
			}).then((response) => {
				return response.json();
			});
		} catch (error) {
			throw error;
		}
	}

	async rateItem(itemId: string, rating: string|number) {
		const url = `${this.urlRoot}/item/${itemId}`;
		return jsonPost(url, {"rating":rating}).catch( (error) =>  {
			throw error;
		});
	}

	async cropImage(itemId:string, cropParams: CropParams)
	{
		const url = `${this.urlRoot}/imageedit/crop/${itemId}`;
		return jsonCall(url, cropParams, "PUT");
	}

	async checkStatus()
	{
		const url = `${this.urlRoot}/status/thumbs`;

		return jsonGet(url);
	}
}

export { PhotoTimeConnection }
