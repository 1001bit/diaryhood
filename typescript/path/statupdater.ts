class StatUpdater {
	name: string;
	pathId: string;

	constructor(name: string, pathId: string) {
		this.name = name;
		this.pathId = pathId;
	}

	save(newStat: CountlessStatInterface): Promise<string> {
		if (newStat.name == "") {
			return Promise.resolve("no name");
		}

		return this.postSave(newStat).then((message) => {
			if (message == "") {
				this.name = newStat.name;
			}
			return message;
		});
	}

	postSave(newStat: CountlessStatInterface): Promise<string> {
		return fetch(`/api/path/${this.pathId}/stat/${this.name}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newStat),
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
							return this.postSave(newStat);
						}
						return "unauthorized";
					});
				default:
					return "error";
			}
		});
	}
}
