package pathmodel

import (
	"context"
	"errors"

	"github.com/1001bit/pathgoer/services/path/shared/postgresclient"
)

var ErrNoDB = errors.New("no database connection")

type Path struct {
	Id     int32
	UserId int32
	Name   string
	Public bool
	Steps  int32
	Stats  map[string]int32
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
	_, err := ps.postgresC.QueryRowContext(ctx, `
	INSERT INTO paths (id, user_id, name, public, steps, other_stats) VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING id
	`, path.Id, path.UserId, path.Name, path.Public, path.Steps, path.Stats)
	return err
}
