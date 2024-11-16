const pathNameInputElem = document.getElementById(
	"path-name-input"
) as HTMLTextAreaElement | null;
const createPathElem = document.getElementById("create-path");

function newPathInit() {
	if (!(pathNameInputElem && createPathElem)) {
		return;
	}

	createPathElem.addEventListener("click", createNewPath);

	// remove style on focus
	setRemoveStyleOnFocus(pathNameInputElem);
}

function createNewPath() {
	if (!(pathNameInputElem && createPathElem)) {
		return;
	}

	const name = pathNameInputElem.value;
	if (name == "") {
		setElemColor(pathNameInputElem, "err");
		return;
	}

	fetch("/api/path", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: name,
		}),
	})
		.then((res) => {
			switch (res.status) {
				case 200:
					break;
				case 400:
					createPathElem.innerText = "no special characters";
					setElemColor(pathNameInputElem, "err");
					break;
				case 409:
					createPathElem.innerText = "path already exists";
					setElemColor(pathNameInputElem, "err");
					break;
				default:
					setElemColor(pathNameInputElem, "err");
					break;
			}
			return res.json();
		})
		.then((res) => {
			if (res && res.id) {
				location.replace(`/path/${res.id}`);
			}
		});
}

newPathInit();
