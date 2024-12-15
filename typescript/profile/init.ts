checkAuthAndRefresh().then((res) => {
	if (res.refreshed) {
		location.reload();
	}
	fetchAndRenderPaths();
});
