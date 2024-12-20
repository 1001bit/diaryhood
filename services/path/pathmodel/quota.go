package pathmodel

type Quota struct {
	quota         int
	countProgress int

	hoursLimit  int
	hoursPassed int

	streak int
}
