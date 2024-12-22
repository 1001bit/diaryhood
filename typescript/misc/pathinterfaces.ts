// stat
interface StatInterface {
	name: string;
	count: number;
	stepEquivalent: number;
}

interface CountlessStatInterface {
	name: string;
	stepEquivalent: number;
}

interface StatCountInterface {
	name: string;
	count: number;
}

// quota
interface QuotaInterface {
	quota: number;
	countProgress: number;
	hoursLimit: number;
	hoursPassed: number;
	streak: number;
}

// path
interface PathInterface {
	id: string;
	name: string;
	public: boolean;
}

interface FullPathInterface extends PathInterface {
	stats: Array<StatInterface>;
	ownerId: string;
}

interface PathWithSteps extends PathInterface {
	steps: number;
}
