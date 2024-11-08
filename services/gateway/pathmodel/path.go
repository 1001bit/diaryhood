package pathmodel

type Stat struct {
	Name           string
	Count          int32
	StepEquivalent int32
}

type Path struct {
	Id    int32
	Name  string
	Stats []Stat
}
