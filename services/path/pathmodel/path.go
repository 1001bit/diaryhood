package pathmodel

import "context"

type Path struct {
	UserId int32
	Name   string
	Public bool
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
