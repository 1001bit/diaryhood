// remove style on focus
setRemoveStyleOnFocus(pathNameInputElem);

createPathButton.addEventListener("click", () => {
	refreshIfNotAuthNd().then((_res) => {
		createNewPath().then((err) => {
			if (err != "") {
				createPathButton.innerText = err;
				setElemColor(pathNameInputElem, "err");
			}
		});
	});
});

pathNameInputElem.addEventListener("input", () => {
	createPathButton.innerText = "create";
});

async function createNewPath(): Promise<string> {
	const name = pathNameInputElem.value;
	if (name == "") {
		setElemColor(pathNameInputElem, "err");
		return "empty";
	}

	return fetch("/api/path", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: name,
		}),
	}).then((res) => {
		switch (res.status) {
			case 200:
				res.json().then((res) => {
					location.replace(`/path/${res.id}`);
				});
				return "";
			case 400:
				return "no special characters";
			case 409:
				return "path already exists";
			case 401:
				return "unauthorized";
			default:
				return "error";
		}
	});
}
