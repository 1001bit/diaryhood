package pathmodel

import (
	"context"
)

type Path struct {
	Name   string `json:"name"`
	Public bool   `json:"public"`
	Stats  []Stat `json:"stats"`
	Id     int32  `json:"id"`
}

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

func (ps *PathStore) DeletePath(ctx context.Context, pathId int32) error {
	_, err := ps.postgresC.ExecContext(ctx, `
		DELETE FROM paths
		WHERE id = $1
	`, pathId)

	return err
}

func (ps *PathStore) GetPaths(ctx context.Context, userId, askerId string) ([]Path, error) {
	rows, err := ps.postgresC.QueryContext(ctx, `
        SELECT id, name, public
        FROM paths
        WHERE user_id = $1 
        AND (public = true OR user_id = $2)
    `, userId, askerId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var paths []Path
	pathMap := make(map[int32]*Path)

	for rows.Next() {
		path := Path{
			Stats: []Stat{},
		}

		if err := rows.Scan(&path.Id, &path.Name, &path.Public); err != nil {
			return nil, err
		}

		paths = append(paths, path)
		pathMap[path.Id] = &paths[len(paths)-1]
	}

	err = ps.FetchStatsIntoPaths(ctx, pathMap)
	return paths, err
}
