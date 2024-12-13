class StatCreator {
	createCallback: (name: string) => void;
	pathId: string;

	constructor(pathId: string) {
		this.pathId = pathId;
		this.createCallback = (_name: string) => {};
		this.initEvents();
	}

	initEvents() {
		createStatButton.addEventListener("click", () => {
			this.create();
		});

		removeBorderColorOnFocus(createStatNameInput);
		createStatNameInput.addEventListener("input", () => {
			createStatButton.innerText = "create";
		});
	}

	setCreateCallback(callback: (name: string) => void) {
		this.createCallback = callback;
	}

	create() {
		const name = createStatNameInput.value;

		this.postCreate(name).then((message) => {
			if (message == "") {
				this.createCallback(name);
				createStatNameInput.value = "";
			} else {
				setBorderColor(createStatNameInput, "err");
				createStatButton.innerText = message;
			}
		});
	}

	postCreate(name: string): Promise<string> {
		return fetch(`/api/path/${this.pathId}/stat`, {
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
					return "";
				case 400:
					return "special characters";
				case 409:
					return "already exists";
				case 401:
					return refresh().then((authd) => {
						if (authd) {
							return this.postCreate(name);
						}
						return "unauthorized";
					});
				default:
					return "error";
			}
		});
	}
}
