/// <reference path="elems.ts"/>

class PathEditor {
	path: Path;

	newName: string;
	newPublic: boolean;

	constructor(path: Path) {
		this.path = path;

		this.newName = "";
		this.newPublic = false;

		this.initEvents();
		removeBorderColorOnFocus(pathNameInput);
	}

	initEvents() {
		// edit button click
		editButton.addEventListener("click", () => {
			this.initNewData();
		});

		// pathPublicButton press
		pathPublicButton.addEventListener("click", () => {
			this.newPublic = !this.newPublic;
			pathPublicButton.innerText = this.newPublic ? "true" : "false";
			this.updateNewData();
		});

		// path name input change
		pathNameInput.addEventListener("input", () => {
			this.newName = pathNameInput.value;
			this.updateNewData();
		});

		// save button click
		saveButton.addEventListener("click", () => {
			this.save();
		});
	}

	initNewData() {
		this.newName = this.path.name;
		pathNameInput.value = this.newName;

		this.newPublic = this.path.isPublic;
		pathPublicButton.innerText = this.newPublic ? "true" : "false";

		this.updateNewData();
	}

	updateNewData() {
		saveButton.innerText = "save";

		if (
			this.newName == this.path.name &&
			this.newPublic == this.path.isPublic
		) {
			setVisibility(saveButton, false);
		} else {
			setVisibility(saveButton, true);
		}
	}

	save() {
		this.newName = pathNameInput.value;
		this.newPublic = pathPublicButton.innerText == "true";

		if (this.newName == "") {
			setBorderColor(pathNameInput, "err");
			saveButton.innerText = "empty name";
			return;
		}

		refreshIfNotAuthNd().then((_res) => {
			this.postNewData().then((err) => {
				if (err != "") {
					saveButton.innerText = err;
					setBorderColor(pathNameInput, "err");
				} else {
					this.updateNewData();
				}
			});
		});
	}

	async postNewData(): Promise<string> {
		return fetch(`/api/path/${this.path.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: this.newName,
				public: this.newPublic,
			}),
		}).then((res) => {
			switch (res.status) {
				case 200:
					this.path.name = this.newName;
					this.path.isPublic = this.newPublic;
					setPageTitle(this.newName);
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
