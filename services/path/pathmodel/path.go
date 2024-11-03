package pathmodel

import "context"

type Path struct {
	UserId int32
	Name   string
	Public bool
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
