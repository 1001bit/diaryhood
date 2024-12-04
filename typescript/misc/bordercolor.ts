function setBorderColor(elem: HTMLElement | null, colorVar: string) {
	if (!elem) {
		return;
	}

	elem.style.borderColor = `var(--${colorVar})`;
}

function removeBorderColorOnFocus(elem: HTMLElement | null) {
	if (!elem) {
		return;
	}
	elem.addEventListener("focus", () => {
		elem.style.borderColor = "";
	});
}
