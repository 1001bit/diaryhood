function renderOwnerElements() {
	setVisibility(changeAvatarElem, true);
	setVisibility(changeNameElem, true);
	setVisibility(noPathsElem, false);
	setVisibility(pathCreateBoxElem, true);
}

checkAuthAndRefresh().then((res) => {
	if (res.authnd) {
		renderOwnerElements();
	}
	fetchAndRenderPaths();
});
