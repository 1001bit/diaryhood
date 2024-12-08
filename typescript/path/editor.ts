/// <reference path="elems.ts"/>

class PathEditor {
	path: Path;

	constructor(path: Path) {
		this.path = path;

		this.initEvents();
		removeBorderColorOnFocus(pathNameInput);
	}

	initEvents() {
		// edit button click
		editButton.addEventListener("click", () => {
			pathNameInput.value = this.path.name;
			pathPublicButton.innerText = this.path.isPublic ? "true" : "false";

			this.showSaveButtonIfChanged();
		});

		// pathPublicButton press
		pathPublicButton.addEventListener("click", () => {
			const newPublic = pathPublicButton.innerText != "true";
			pathPublicButton.innerText = newPublic ? "true" : "false";

			this.showSaveButtonIfChanged();
		});

		// path name input change
		pathNameInput.addEventListener("input", () => {
			this.showSaveButtonIfChanged();
		});

		// save button click
		pathSaveButton.addEventListener("click", () => {
			this.save();
		});
	}

	showSaveButtonIfChanged() {
		pathSaveButton.innerText = "save";

		const newName = pathNameInput.value;
		const newPublic = pathPublicButton.innerText == "true";

		if (newName == this.path.name && newPublic == this.path.isPublic) {
			setVisibility(pathSaveButton, false);
		} else {
			setVisibility(pathSaveButton, true);
		}
	}

	save() {
		if (pathNameInput.value == "") {
			setBorderColor(pathNameInput, "err");
			pathSaveButton.innerText = "empty name";
			return;
		}

		refreshIfNotAuthNd().then((_res) => {
			this.postNewData().then((err) => {
				if (err != "") {
					pathSaveButton.innerText = err;
					setBorderColor(pathNameInput, "err");
					return;
				}
				this.showSaveButtonIfChanged();
			});
		});
	}

	async postNewData(): Promise<string> {
		const newName = pathNameInput.value;
		const newPublic = pathPublicButton.innerText == "true";

		return fetch(`/api/path/${this.path.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: newName,
				public: newPublic,
			}),
		}).then((res) => {
			switch (res.status) {
				case 200:
					this.path.name = newName;
					this.path.isPublic = newPublic;
					setPageTitle(newName);
					return "";
				case 400:
					return "special characters";
				case 409:
					return "path already exists";
				case 401:
					return "unauthorized";
				default:
					return "error";
			}
		});
	}
}
