package pathmodel

import (
	"context"
	"log/slog"

	"github.com/lib/pq"
)

type Stat struct {
	Name           string `json:"name"`
	Count          int32  `json:"count"`
	StepEquivalent int32  `json:"stepEquivalent"`
}

func (ps *PathStore) UpdateStats(ctx context.Context, pathId int32, stats []Stat) error {
	if len(stats) == 0 {
		return nil
	}

	// Start transaction
	tx, err := ps.postgresC.BeginTx(ctx)
	if err != nil {
		return err
	}

	for _, stat := range stats {
		_, err = tx.ExecContext(ctx, `
			INSERT INTO stats (path_id, name, count, step_equivalent)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (path_id, name) 
			DO UPDATE SET count = $3, step_equivalent = $4
		`, pathId, stat.Name, stat.Count, stat.StepEquivalent)

		if err != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				slog.With("err", rollbackErr).Error("Failed to rollback")
			}
			return err
		}
	}

	return tx.Commit()
}

func (ps *PathStore) DeleteStats(ctx context.Context, pathId int32, names []string) error {
	if len(names) == 0 {
		return nil
	}

	// Start transaction
	tx, err := ps.postgresC.BeginTx(ctx)
	if err != nil {
		return err
	}

	for _, name := range names {
		_, err = tx.ExecContext(ctx, `
			DELETE FROM stats
			WHERE path_id = $1 AND name = $2
		`, pathId, name)

		if err != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				slog.With("err", rollbackErr).Error("Failed to rollback")
			}
			return err
		}
	}

	return tx.Commit()
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
