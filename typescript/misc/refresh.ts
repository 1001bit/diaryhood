async function refreshIfNotAuthNd(): Promise<boolean> {
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
