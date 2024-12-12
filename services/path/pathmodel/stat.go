package pathmodel

import (
	"context"

	"github.com/lib/pq"
)

type Stat struct {
	Name           string `json:"name"`
	Count          int32  `json:"count"`
	StepEquivalent int32  `json:"stepEquivalent"`
}

func (ps *PathStore) UpdateStat(ctx context.Context, pathId, statName string, stat *Stat, askerId string) error {
	_, err := ps.postgresC.ExecContext(ctx, `
		UPDATE stats
		SET name = $1, step_equivalent = $2
		WHERE path_id = $3 AND name = $4
		AND EXISTS (
			SELECT 1 
			FROM paths 
			WHERE id = $3 AND user_id = $5
		)
	`, stat.Name, stat.StepEquivalent, pathId, statName, askerId)

	return err
}

func (ps *PathStore) CreateStat(ctx context.Context, pathId string, name, askerId string) error {
	_, err := ps.postgresC.ExecContext(ctx, `
		WITH check_path AS (
			SELECT 1 
			FROM paths 
			WHERE id = $1 AND user_id = $3
		)
		INSERT INTO stats (path_id, name)
		SELECT $1, $2
		FROM check_path;
	`, pathId, name, askerId)

	return err
}

func (ps *PathStore) DeleteStat(ctx context.Context, pathId string, name string, askerId string) error {
	_, err := ps.postgresC.ExecContext(ctx, `
		DELETE FROM stats
		WHERE path_id = $1 AND name = $2
		AND EXISTS (
			SELECT 1 
			FROM paths 
			WHERE id = $1 AND user_id = $3
		)
	`, pathId, name, askerId)

	return err
}

func (ps *PathStore) GetStats(ctx context.Context, pathId int32) ([]Stat, error) {
	statsRows, err := ps.postgresC.QueryContext(ctx, `
		SELECT name, count, step_equivalent
		FROM stats
		WHERE path_id = $1
	`, pathId)
	if err != nil {
		return nil, err
	}
	defer statsRows.Close()

	var stats []Stat
	for statsRows.Next() {
		var stat Stat
		if err := statsRows.Scan(&stat.Name, &stat.Count, &stat.StepEquivalent); err != nil {
			return nil, err
		}
		stats = append(stats, stat)
	}

	return stats, nil
}

func (ps *PathStore) FetchStatsIntoPaths(ctx context.Context, pathMap map[int32]*Path) error {
	// Fetch all stats in a single query
	statsRows, err := ps.postgresC.QueryContext(ctx, `
        SELECT path_id, name, count, step_equivalent
        FROM stats
        WHERE path_id = ANY($1)
    `, pq.Array(getKeys(pathMap)))
	if err != nil {
		return err
	}
	defer statsRows.Close()

	for statsRows.Next() {
		var stat Stat
		var pathId int32
		if err := statsRows.Scan(&pathId, &stat.Name, &stat.Count, &stat.StepEquivalent); err != nil {
			return err
		}
		if path, exists := pathMap[pathId]; exists {
			path.Stats = append(path.Stats, stat)
		}
	}

	return nil
}

func getKeys(m map[int32]*Path) []int32 {
	keys := make([]int32, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}
