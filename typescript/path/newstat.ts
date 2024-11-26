async function postPath(name: string, stepEq: number): Promise<string> {
	console.log(name, stepEq, pathId);
	return fetch(`/api/path/${pathId}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: name,
			stepEq: stepEq,
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
				return "unauthorized";
			default:
				return "error";
		}
	});
}

function renderNewStat(name: string, stepEq: number) {
	const newStatElem = newStatCard({
		name: name,
		count: 0,
		stepEquivalent: stepEq,
	});

	statsElem.insertBefore(newStatElem, statsElem.firstChild);
}

removeBorderColorOnFocus(statNameInputElem);
removeBorderColorOnFocus(statStepEqInputElem);
statNameInputElem.addEventListener("input", () => {
	createStatButtonElem.innerText = "create";
});
statStepEqInputElem.addEventListener("input", () => {
	createStatButtonElem.innerText = "create";
});

createStatButtonElem.addEventListener("click", () => {
	const name = statNameInputElem.value;
	const stepEq = Number(statStepEqInputElem.value);

	if (!stepEq) {
		createStatButtonElem.innerText = "wrong step eq.";
		setBorderColor(statStepEqInputElem, "err");
		return;
	}

	postPath(name, Number(stepEq)).then((res) => {
		if (res == "") {
			statNameInputElem.value = "";
			statStepEqInputElem.value = "";
			renderNewStat(name, stepEq);
		} else {
			createStatButtonElem.innerText = res;
			setBorderColor(statNameInputElem, "err");
		}
	});
});
