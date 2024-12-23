// border color
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

function removeBorderColor(elem: HTMLElement | null) {
	if (!elem) {
		return;
	}
	elem.style.borderColor = "";
}

// color
function setColor(elem: HTMLElement | null, colorVar: string) {
	if (!elem) {
		return;
	}
	elem.style.color = `var(--${colorVar})`;
}

function removeColor(elem: HTMLElement | null) {
	if (!elem) {
		return;
	}
	elem.style.color = "";
}
