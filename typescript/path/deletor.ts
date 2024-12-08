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
		pathDeleteButton.addEventListener("click", () => {
			if (!this.askedIfSure) {
				pathDeleteButton.innerText = "sure?";
				this.askedIfSure = true;
				return;
			}

			this.deletePath().then((err) => {
				if (err != "") {
					pathDeleteButton.innerText = err;
					setBorderColor(pathDeleteButton, "err");
					return;
				}

				window.location.replace("/user");
			});
		});

		// make sure false
		editButton.addEventListener("click", () => {
			this.cancelDelete();
		});

		pathSaveButton.addEventListener("click", () => {
			this.cancelDelete();
		});
	}

	cancelDelete() {
		this.askedIfSure = false;
		pathDeleteButton.innerText = "delete";
	}

	async deletePath(): Promise<string> {
		return fetch(`/api/path/${this.pathId}`, {
			method: "DELETE",
		}).then((res) => {
			switch (res.status) {
				case 200:
					return "";
				case 401:
					return refreshIfNotAuthNd().then((authd) => {
						if (authd) {
							return this.deletePath();
						}
						return "unauthorized";
					});
				default:
					return "error";
			}
		});
	}
}
