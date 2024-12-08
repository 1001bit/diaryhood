// needed when it's just better to be authenticated
async function checkAuthAndRefresh(): Promise<boolean> {
	return fetch("/authenticated", {
		method: "GET",
	}).then((res) => {
		if (res.status == 401) {
			return fetch("/auth/refresh", {
				method: "GET",
			}).then((res) => {
				if (res.status == 200) {
					return true;
				}
				return false;
			});
		}
		return true;
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
