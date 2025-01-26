package pathmodel

import (
	"context"
	"database/sql"

	"github.com/lib/pq"
)

func (ps *PathStore) CreatePath(ctx context.Context, userId, pathName string) (string, error) {
	row, err := ps.postgresC.QueryRowContext(ctx, `
		INSERT INTO paths (user_id, name) VALUES ($1, $2) RETURNING id
	`, userId, pathName)
	if err != nil {
		return "", err
	}

	id := ""
	err = row.Scan(&id)

	return id, err
}

func (ps *PathStore) UpdatePath(ctx context.Context, newPath Path, askerId string) error {
	result, err := ps.postgresC.ExecContext(ctx, `
		UPDATE paths
		SET name = $1, public = $2
		WHERE id = $3 AND user_id = $4
	`, newPath.Name, newPath.Public, newPath.Id, askerId)

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

func (ps *PathStore) DeletePath(ctx context.Context, pathId string, askerId string) error {
	result, err := ps.postgresC.ExecContext(ctx, `
		DELETE FROM paths
		WHERE id = $1 AND user_id = $2
	`, pathId, askerId)

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (ps *PathStore) GetFullPath(ctx context.Context, askerId, pathId string) (FullPath, error) {
	row, err := ps.postgresC.QueryRowContext(ctx, `
		SELECT id, name, public, user_id
		FROM paths
		WHERE id = $1
		AND (public = true OR user_id = $2)
	`, pathId, askerId)
	if err != nil {
		return FullPath{}, err
	}

	path := FullPath{
		Stats: []Stat{},
	}

	if err := row.Scan(&path.Id, &path.Name, &path.Public, &path.OwnerId); err != nil {
		return FullPath{}, err
	}

	path.Stats, err = ps.GetStats(ctx, path.Id)

	return path, err
}

func (ps *PathStore) GetPaths(ctx context.Context, userId, askerId string) ([]PathWithSteps, error) {
	rows, err := ps.postgresC.QueryContext(ctx, `
		SELECT 
			p.id, 
			p.name, 
			p.public, 
			COALESCE(SUM(s.count * s.step_equivalent), 0) AS total_steps
		FROM 
			paths p
		LEFT JOIN 
			stats s
		ON 
			s.path_id = p.id
		WHERE 
			p.user_id = $1 
			AND (p.public = true OR p.user_id = $2)
		GROUP BY 
			p.id, p.name, p.public;
    `, userId, askerId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	paths := make([]PathWithSteps, 0)

	for rows.Next() {
		path := PathWithSteps{}

		if err := rows.Scan(&path.Id, &path.Name, &path.Public, &path.Steps); err != nil {
			return nil, err
		}

		paths = append(paths, path)
	}

	return paths, err
}

func (ps *PathStore) GetHomePaths(ctx context.Context, askerId string) ([]HomePath, error) {
	rows, err := ps.postgresC.QueryContext(ctx, `
		SELECT 
			p.id, 
			p.name,
			COALESCE(SUM(s.count * s.step_equivalent), 0) AS total_steps,
			ARRAY(
				SELECT 
					s.name
				FROM 
					stats s
				LEFT JOIN 
					quotas q
				ON 
					s.name = q.stat_name AND s.path_id = q.path_id
				WHERE 
					s.path_id = p.id AND s.count < q.last_count + q.quota
			)
		FROM 
			paths p
		LEFT JOIN 
			stats s
		ON 
			s.path_id = p.id
		WHERE 
			p.user_id = $1 
		GROUP BY 
			p.id, p.name, p.public;
	`, askerId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	paths := make([]HomePath, 0)

	for rows.Next() {
		path := HomePath{}
		if err := rows.Scan(&path.Id, &path.Name, &path.Steps, pq.Array(&path.Stats)); err != nil {
			return nil, err
		}
		paths = append(paths, path)
	}

	return paths, nil
}
