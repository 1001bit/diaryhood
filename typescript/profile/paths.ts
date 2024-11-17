const mainElem = document.getElementsByTagName("main")[0] as HTMLDivElement;
const userId = mainElem.getAttribute("data-user-id");

const pathsElem = document.getElementById("paths") as HTMLDivElement;

fetch(`/api/path/user/${userId}`, {
	method: "GET",
})
	.then((res) => {
		if (res.status == 200) {
			return res.json();
		} else {
			return [];
		}
	})
	.then((paths) => {
		console.log(paths);
	});
