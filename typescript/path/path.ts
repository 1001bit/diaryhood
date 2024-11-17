// TODO: Render full page, from title to stats
const titleElem = document.getElementById("title");
const pathId = window.location.pathname.split("/").pop();

fetch(`/api/path/${pathId}`, {
	method: "GET",
})
	.then((res) => {
		if (res.status == 200) {
			return res.json();
		} else {
			return [];
		}
	})
	.then((data) => {
		console.log(data);
	});
