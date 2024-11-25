function setElemColor(elem: HTMLElement | null, colorVar: string) {
	if (!elem) {
		return;
	}

	elem.style.border = `2px solid var(--${colorVar})`;
}

function setRemoveStyleOnFocus(elem: HTMLElement | null) {
	if (!elem) {
		return;
	}
	elem.addEventListener("focus", () => {
		setVisibility(elem, true);
	});
}
