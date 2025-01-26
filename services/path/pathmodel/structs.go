package pathmodel

// Quota
type QuotaEditable struct {
	Quota      int32 `json:"quota"`
	HoursLimit int32 `json:"hoursLimit"`
}

type Quota struct {
	QuotaEditable

	CountProgress int32 `json:"countProgress"`
	HoursPassed   int32 `json:"hoursPassed"`
	Streak        int32 `json:"streak"`
}

// Stat
type Stat struct {
	Name           string `json:"name"`
	Count          int32  `json:"count"`
	StepEquivalent int32  `json:"stepEquivalent"`
	Quota          Quota  `json:"quota"`
}

type CountlessStat struct {
	Name           string        `json:"name"`
	StepEquivalent int32         `json:"stepEquivalent"`
	Quota          QuotaEditable `json:"quota"`
}

type StatCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

// Path
type Path struct {
	Name   string `json:"name"`
	Public bool   `json:"public"`
	Id     string `json:"id"`
}

type FullPath struct {
	Path
	Stats   []Stat `json:"stats"`
	OwnerId string `json:"ownerId"`
}

type PathWithSteps struct {
	Path
	Steps int `json:"steps"`
}

type HomePath struct {
	PathWithSteps
	Steps int      `json:"steps"`
	Stats []string `json:"stats"`
}
