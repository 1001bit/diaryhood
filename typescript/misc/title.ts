// navbar
const titleElem = document.getElementById("title") as HTMLDivElement;

function setPageTitle(title: string) {
	titleElem.innerText = title;
	document.title = title;
}
