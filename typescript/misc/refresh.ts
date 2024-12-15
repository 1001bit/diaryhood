// needed when it's just better to be authenticated
interface authAndRefresh {
	authnd: boolean;
	refreshed: boolean;
}

async function checkAuthAndRefresh(): Promise<authAndRefresh> {
	return fetch("/authenticated", {
		method: "GET",
	}).then((res) => {
		if (res.status == 401) {
			return fetch("/auth/refresh", {
				method: "GET",
			}).then((res) => {
				if (res.status == 200) {
					return {
						authnd: true,
						refreshed: true,
					};
				}
				return {
					authnd: false,
					refreshed: false,
				};
			});
		}
		return {
			authnd: true,
			refreshed: false,
		};
	});
}

// needed to refresh if not authenticated
async function refresh(): Promise<boolean> {
	return fetch("/auth/refresh", {
		method: "GET",
	}).then((res) => {
		if (res.status == 200) {
			return true;
		}
		return false;
	});
}
