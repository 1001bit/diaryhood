class StatDeleter {
	askedIfSure: boolean;

	deleteCallback: () => void;

	pathId: string;
	name: string;

	constructor(pathId: string, name: string) {
		this.deleteCallback = () => {};

		this.pathId = pathId;
		this.name = name;

		this.askedIfSure = false;
	}

	setDeleteCallback(callback: () => void) {
		this.deleteCallback = callback;
	}

	delete(): Promise<string> {
		if (!this.askedIfSure) {
			this.askedIfSure = true;
			return Promise.resolve("sure?");
		}

		return this.postDelete().then((message) => {
			if (message == "") {
				this.deleteCallback();
			}

			return message;
		});
	}

	postDelete(): Promise<string> {
		return fetch(`/api/path/${this.pathId}/stat/${this.name}`, {
			method: "DELETE",
		}).then((res) => {
			switch (res.status) {
				case 200:
					return "";
				case 401:
					return refresh().then((authd) => {
						if (authd) {
							return this.postDelete();
						}
						return "unauthorized";
					});
				default:
					return "error";
			}
		});
	}
}
