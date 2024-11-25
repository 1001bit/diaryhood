function setVisibility(elem: HTMLElement | null, visible: boolean) {
	if (elem) {
		elem.classList.toggle("hidden", !visible);
	}
}
