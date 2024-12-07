class NumberInput {
	private inputElem: HTMLInputElement;
	private plus: HTMLDivElement;
	private minus: HTMLDivElement;

	constructor(elem: HTMLDivElement) {
		this.inputElem = elem.getElementsByTagName(
			"input"
		)[0] as HTMLInputElement;

		this.plus = elem.getElementsByClassName("plus")[0] as HTMLDivElement;
		this.minus = elem.getElementsByClassName("minus")[0] as HTMLDivElement;

		this.initEvents();
	}

	initEvents() {
		this.plus.addEventListener("click", () => {
			this.inputElem.value = (
				Number(this.inputElem.value) + 1
			).toString();
		});
		this.minus.addEventListener("click", () => {
			this.inputElem.value = (
				Number(this.inputElem.value) - 1
			).toString();
		});

		this.inputElem.addEventListener("input", () => {
			this.inputElem.value = this.inputElem.value.replace(/[^0-9]/g, "");
		});
	}

	setValue(value: number) {
		this.inputElem.value = value.toString();
	}
}
