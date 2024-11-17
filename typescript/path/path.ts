// TODO: Render full page, from title to stats
const titleElem = document.getElementById("title") as HTMLDivElement;
const pathId = window.location.pathname.split("/").pop();

interface PathResponse {
	path: Path;
	editRight: boolean;
}

function setPathTitle(title: string) {
	titleElem.innerText = title;
	document.title = title;
}

function handlePathData(data: PathResponse) {
	setPathTitle(data.path.name);
}

fetch(`/api/path/${pathId}`, {
	method: "GET",
})
	.then((res) => {
		if (res.status == 200) {
			return res.json();
		}
		location.replace("/404");
		return [];
	})
	.then((data) => {
		console.log(data);
		handlePathData(data);
	});
