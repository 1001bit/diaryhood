interface Stat {
	name: string;
	count: number;
	stepEquivalent: number;
}

interface Path {
	id: string;
	name: string;
	public: boolean;
	stats: Stat[];
}
