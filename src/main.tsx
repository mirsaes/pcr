import React from "react";
import ReactDOM from "react-dom/client";

import {
	createBrowserRouter,
	RouterProvider,
	Route,
} from "react-router-dom";

import "./pcr.css";

import ErrorPage from "./ErrorPage";
import Root, { serverLoader as serverLoader } from "./routes/Root";
import Settings, {serverLoader as settingsServerLoader } from "./routes/Settings";
import Repos, {reposLoader as reposLoader } from './routes/Repos';
import Repo, { repoLoader } from './routes/Repo';
import Items, {loader as itemsLoader } from './routes/Items';
import ItemView, {loader as itemViewLoader } from "./routes/ItemView";
import ItemEdit, {loader as itemEditLoader } from "./routes/ItemEdit";
import { gServers, gServers as serverstore } from './ServerDataSource';

// load servers before configuring routes so that a refresh on a repo will have servers loaded
//await gServers.loadServers();
const appBasename = ((path) => path.substring(0, path.lastIndexOf('/')))(window.location.pathname);
console.log(appBasename);

const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
		loader: serverLoader,
		//action: serverAddAction
		errorElement: <ErrorPage/>
	},
	{
		path: "/settings",
		element: <Settings/>,
		loader: settingsServerLoader,
	},
	{
		path: "/:serverId/repos",
		element: <Repos/>,
		loader: reposLoader,
	},
	{
		path: "/:serverId/repo",
		element: <Repo />,
		loader: repoLoader,
	},
	{
		path: "/:serverId/items",
		element: <Items />,
		loader: itemsLoader,
	},
	{
		path: "/:serverId/itemView",
		element: <ItemView/>,
		loader: itemViewLoader,
	},
	{
		path: "/:serverId/itemEdit",
		element: <ItemEdit/>,
		loader: itemEditLoader
	}
], {basename: appBasename});

gServers.loadServers().then( () => {
	ReactDOM.createRoot(document.getElementById("pcr")!).render(
		<React.StrictMode>
			<RouterProvider router={router}/>
		</React.StrictMode>
	);	
}, (reason) => {
	console.warn("oops");
});
