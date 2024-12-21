interface StatInterface {
	name: string;
	count: number;
	stepEquivalent: number;
}

interface CountlessStatInterface {
	name: string;
	stepEquivalent: number;
}

interface PathInterface {
	id: string;
	name: string;
	public: boolean;
	stats: StatInterface[];
}

interface PathWithSteps {
	id: string;
	name: string;
	public: boolean;
	steps: number;
}
