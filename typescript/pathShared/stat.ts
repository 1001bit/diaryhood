class StatElem {
	stat: HTMLDivElement;
	name: HTMLDivElement;
	stepEq: HTMLDivElement;
	quota: HTMLDivElement;
	quotaTime: HTMLDivElement;
	quotaStreak: HTMLDivElement;
	countInput: NumberInput;

	constructor(countEditRight: boolean) {
		this.stat = sampleStatElem.cloneNode(true) as HTMLDivElement;
		this.name = this.stat.getElementsByClassName(
			"stat-name"
		)[0] as HTMLDivElement;
		this.stepEq = this.stat.getElementsByClassName(
			"stat-stepeq"
		)[0] as HTMLDivElement;
		this.quota = this.stat.getElementsByClassName(
			"stat-quota"
		)[0] as HTMLDivElement;
		this.quotaTime = this.stat.getElementsByClassName(
			"stat-quota-time"
		)[0] as HTMLDivElement;
		this.quotaStreak = this.stat.getElementsByClassName(
			"stat-quota-streak"
		)[0] as HTMLDivElement;
		this.countInput = new NumberInput(
			this.stat.getElementsByClassName(
				"stat-count-input"
			)[0] as HTMLDivElement
		);

		// stat elem
		this.stat.removeAttribute("id");
		setVisibility(this.stat, true);

		// count
		setVisibility(this.countInput.getElem(), countEditRight);
	}

	setQuotaHighlight(highlight: boolean, streak: number) {
		if (highlight) {
			setColor(this.quota, "acc1");
			setColor(this.quotaStreak, "acc1");
			this.quotaStreak.innerText = `🔥 ${streak + 1}`;
		} else {
			removeColor(this.quota);
			removeColor(this.quotaStreak);
			this.quotaStreak.innerText = `🔥 ${streak}`;
		}
	}

	setStepEq(count: number, stepEq: number) {
		this.stepEq.innerText = `${count} * ${stepEq} 👣`;
	}

	setQuota(quota: number, hoursPassed: number, hoursLimit: number) {
		// quota
		if (quota > 0 && hoursLimit > 0) {
			this.quota.innerText = `🚩 ${quota}`;
			this.quotaTime.innerText = `⏳️ ${hoursPassed}/${hoursLimit} hrs`;
		} else {
			this.quota.innerText = "";
			this.quotaTime.innerText = "no quota";
			this.quotaStreak.innerText = "";
		}
	}

	setCountValue(count: number) {
		this.countInput.setValue(count);
	}
}

class StatStepCounter {
	steps: number;
	stepsUpdateCallback: () => void;

	constructor() {
		this.steps = 0;
		this.stepsUpdateCallback = () => {};
	}

	updateSteps(count: number, stepEq: number) {
		this.steps = count * stepEq;
		this.stepsUpdateCallback();
	}
}

class StatCountCounter {
	presentCount: number;

	constructor(count: number) {
		this.presentCount = count;
	}

	updatePresentCount(
		inputValue: number,
		quotaProgress: number,
		statCount: number
	): number {
		if (isNaN(inputValue)) {
			inputValue = 0;
		}

		this.presentCount = inputValue - quotaProgress + statCount;
		return this.presentCount;
	}

	calculatePresentQuotaProgress(
		quotaProgress: number,
		statCount: number
	): number {
		return quotaProgress + this.presentCount - statCount;
	}
}

class PageStat {
	stat: StatInterface;
	countCounter: StatCountCounter;
	stepCounter: StatStepCounter;
	statElems: StatElem;

	constructor(stat: StatInterface, countEditRight: boolean) {
		this.stat = stat;
		this.countCounter = new StatCountCounter(stat.count);

		this.stepCounter = new StatStepCounter();

		this.statElems = new StatElem(countEditRight);

		this.updateStatElemsValues();
		this.initEvents();
	}

	initEvents() {
		this.statElems.countInput.addInputListener((_num: number) => {
			this.updateCount();
		});
	}

	updateCount() {
		const presentCount = this.countCounter.updatePresentCount(
			Number(this.statElems.countInput.getValue()),
			this.stat.quota.countProgress,
			this.stat.count
		);
		this.stepCounter.updateSteps(presentCount, this.stat.stepEquivalent);

		this.statElems.setStepEq(presentCount, this.stat.stepEquivalent);
		this.updateQuotaHighlight();
	}

	updateQuotaHighlight() {
		if (this.stat.quota.quota <= 0 || this.stat.quota.hoursLimit <= 0) {
			return;
		}

		const currentQuotaProgress =
			this.countCounter.calculatePresentQuotaProgress(
				this.stat.quota.countProgress,
				this.stat.count
			);

		this.statElems.setQuotaHighlight(
			currentQuotaProgress >= this.stat.quota.quota,
			this.stat.quota.streak
		);
	}

	updateStatElemsValues() {
		// name
		this.statElems.name.innerText = this.stat.name;
		// stepeq
		this.statElems.setStepEq(
			this.countCounter.presentCount,
			this.stat.stepEquivalent
		);

		// quota
		this.statElems.setQuota(
			this.stat.quota.quota,
			this.stat.quota.hoursPassed,
			this.stat.quota.hoursLimit
		);
		this.updateQuotaHighlight();

		// count
		this.statElems.setCountValue(
			this.countCounter.calculatePresentQuotaProgress(
				this.stat.quota.countProgress,
				this.stat.count
			)
		);

		// steps
		this.stepCounter.updateSteps(
			this.countCounter.presentCount,
			this.stat.stepEquivalent
		);
	}
}
