// quota
interface QuotaEditableInterface {
	quota: number;
	hoursLimit: number;
}

interface QuotaInterface extends QuotaEditableInterface {
	countProgress: number;
	hoursPassed: number;
	streak: number;
}

// stat
interface StatInterface {
	name: string;
	count: number;
	stepEquivalent: number;
	quota: QuotaInterface;
}

interface CountlessStatInterface {
	name: string;
	stepEquivalent: number;
	quota: QuotaEditableInterface;
}

interface StatCountInterface {
	name: string;
	count: number;
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
