// server.ip, server.port
export interface serverInfo {
	id?: string;
	scheme?: string;
	host: string;
	port: number;
}

var gServers = (function () {
	var servers: serverInfo[] = [];
	
	return {
		add: function(server: serverInfo) {
			if (!server.id) {
				server.id=`${server.host}:${server.port}`;
			}
			// check for duplicate..
			// could switch to map..
			if (this.getById(server.id))
				return;
			servers.push(server);
			this.cleanupServers();
		},
		getById: function(serverId: string) : serverInfo|false{
			for (let idx = 0; idx < servers.length; ++idx) {
				let server = servers[idx];
				if (server.id == serverId) {
					return server;
				}
			}
			return false;
		},
		deleteById: function(serverId: string) {
			for (let idx = 0; idx < servers.length; ++idx) {
				let server = servers[idx];
				if (server.id == serverId) {
					this.removeAt(idx);
					return;
				}
			}
		},

		removeAt: function(index: number) {
			servers.splice(index,1);
		},
		size: function() {
			return servers.length;
		},
		item: function(index: number) {
			if (index < servers.length)
				return servers[index];
			return;
		},
		get: function() {
			return servers;
		},
		cleanupServers: function() {
			var newServers: serverInfo[] = [];
			for (let idx = 0; idx < servers.length; ++idx) {
				let server = servers[idx];
				if (server.host == "" || !server.port)
					continue;
				newServers.push(server);
			}
			servers = newServers;
			this.storeServers();
		},
	
		storeServers: function() {
			localStorage.setItem('servers', JSON.stringify(servers));
		},
		
		loadServers: async function() {
			if (typeof localStorage == 'undefined')
				console.log('oh no .... localStorage is not defined');
			var s = localStorage.getItem('servers');
			if (s == null)
				servers = [];
			else
				servers = JSON.parse(s);
            
            return servers;
			
			// cbk for loading servers
			//if (typeof onLoadedFn == 'function')
			//	onLoadedFn();
		}
	};
})();

export  { gServers };
