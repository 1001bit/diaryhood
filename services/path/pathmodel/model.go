package pathmodel

import (
	"context"
	"log/slog"

	"github.com/1001bit/pathgoer/services/path/shared/postgresclient"
)

type Path struct {
	UserId int32
	Name   string
	Public bool
}

type Stat struct {
	Name           string
	Count          int32
	StepEquivalent int32
}

type PathStore struct {
	postgresC *postgresclient.Client
}

func NewPathStore(postgresC *postgresclient.Client) *PathStore {
	return &PathStore{
		postgresC: postgresC,
	}
}

func (ps *PathStore) CreatePath(ctx context.Context, path Path) error {
	_, err := ps.postgresC.ExecContext(ctx, `
		INSERT INTO paths (user_id, name, public) VALUES ($1, $2, $3)
	`, path.UserId, path.Name, path.Public)

	return err
}

func (ps *PathStore) GetPathId(ctx context.Context, pathName string, userId, askerId int32) (int32, error) {
	var id int32
	row, err := ps.postgresC.QueryRowContext(ctx, `
		SELECT id FROM paths
		WHERE name = $1 AND user_id = $2
		AND (public = true OR user_id = $3)
	`, pathName, userId, askerId)
	if err != nil {
		return 0, err
	}
	err = row.Scan(&id)

	return id, err
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

func (ps *PathStore) GetStats(ctx context.Context, pathId int32) ([]Stat, error) {
	rows, err := ps.postgresC.QueryContext(ctx, `
		SELECT name, count, step_equivalent
		FROM stats
		WHERE path_id = $1
	`, pathId)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var stats []Stat
	for rows.Next() {
		var stat Stat
		if err := rows.Scan(&stat.Name, &stat.Count, &stat.StepEquivalent); err != nil {
			return nil, err
		}
		stats = append(stats, stat)
	}

	return stats, nil
}
