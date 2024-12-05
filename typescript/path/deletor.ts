class PathDeletor {
	pathId: string;
	askedIfSure: boolean;

	constructor(pathId: string) {
		this.pathId = pathId;
		this.askedIfSure = false;

		this.initEvents();
	}

	initEvents() {
		// delete
		deleteButton.addEventListener("click", () => {
			if (!this.askedIfSure) {
				deleteButton.innerText = "sure?";
				this.askedIfSure = true;
				return;
			}

			refreshIfNotAuthNd().then((_res) => {
				this.deletePath().then((err) => {
					if (err != "") {
						deleteButton.innerText = err;
						setBorderColor(deleteButton, "err");
						return;
					}

					window.location.replace("/user");
				});
			});
		});

		// make sure false
		editButton.addEventListener("click", () => {
			this.cancelDelete();
		});

		saveButton.addEventListener("click", () => {
			this.cancelDelete();
		});
	}

	cancelDelete() {
		this.askedIfSure = false;
		deleteButton.innerText = "delete";
	}

	async deletePath(): Promise<string> {
		return fetch(`/api/path/${this.pathId}`, {
			method: "DELETE",
		}).then((res) => {
			switch (res.status) {
				case 200:
					return "";
				case 401:
					return "unauthorized";
				default:
					return "error";
			}
		});
	}
}
