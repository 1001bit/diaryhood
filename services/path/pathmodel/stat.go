package pathmodel

import (
	"context"
	"database/sql"
)

func (ps *PathStore) UpdateStat(ctx context.Context, pathId, statName string, stat *CountlessStat, askerId string) error {
	result, err := ps.postgresC.ExecContext(ctx, `
		UPDATE stats
		SET name = $1, step_equivalent = $2
		WHERE path_id = $3 AND name = $4
		AND EXISTS (
			SELECT 1 
			FROM paths 
			WHERE id = $3 AND user_id = $5
		)
	`, stat.Name, stat.StepEquivalent, pathId, statName, askerId)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (ps *PathStore) UpdateStatsCounts(ctx context.Context, pathId string, counts []StatCount, askerId string) error {
	tx, err := ps.postgresC.BeginTx(ctx)
	if err != nil {
		return err
	}

	stmt, err := tx.PrepareContext(ctx, `
		UPDATE stats
		SET count = $1
		WHERE path_id = $2 AND name = $3
		AND EXISTS (
			SELECT 1 
			FROM paths 
			WHERE id = $2 AND user_id = $4
		)
	`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, count := range counts {
		_, err := stmt.ExecContext(ctx, count.Count, pathId, count.Name, askerId)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

func (ps *PathStore) CreateStat(ctx context.Context, pathId string, name, askerId string) error {
	result, err := ps.postgresC.ExecContext(ctx, `
		WITH check_path AS (
			SELECT 1 
			FROM paths 
			WHERE id = $1 AND user_id = $3
		)
		INSERT INTO stats (path_id, name)
		SELECT $1, $2
		FROM check_path;
	`, pathId, name, askerId)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (ps *PathStore) DeleteStat(ctx context.Context, pathId string, name string, askerId string) error {
	result, err := ps.postgresC.ExecContext(ctx, `
		DELETE FROM stats
		WHERE path_id = $1 AND name = $2
		AND EXISTS (
			SELECT 1 
			FROM paths 
			WHERE id = $1 AND user_id = $3
		)
	`, pathId, name, askerId)

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (ps *PathStore) GetStats(ctx context.Context, pathId string) ([]Stat, error) {
	statsRows, err := ps.postgresC.QueryContext(ctx, `
		SELECT 
			s.name, 
			s.count, 
			s.step_equivalent, 
			q.quota, 
			q.duration_hours,
			(s.count - q.last_count) as count_progress,
			FLOOR(( EXTRACT(EPOCH FROM now()) - EXTRACT(EPOCH FROM q.last_done) )/3600) as hours_passed,
			q.streak
		FROM 
			stats s
		JOIN 
			quotas q
		ON 
			s.name = q.stat_name AND s.path_id = q.path_id
		WHERE 
			s.path_id = $1;
	`, pathId)
	if err != nil {
		return nil, err
	}
	defer statsRows.Close()

	var stats []Stat
	for statsRows.Next() {
		var stat Stat
		if err := statsRows.Scan(
			&stat.Name,
			&stat.Count,
			&stat.StepEquivalent,
			&stat.Quota.Quota,
			&stat.Quota.HoursLimit,
			&stat.Quota.CountProgress,
			&stat.Quota.HoursPassed,
			&stat.Quota.Streak,
		); err != nil {
			return nil, err
		}
		stats = append(stats, stat)
	}

	return stats, nil
}

func getKeys(m map[int32]*Path) []int32 {
	keys := make([]int32, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}
