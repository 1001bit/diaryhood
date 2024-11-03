package pathmodel

import (
	"context"
	"errors"

	"github.com/1001bit/pathgoer/services/path/shared/postgresclient"
)

var ErrNoDB = errors.New("no database connection")

type Path struct {
	UserId int32
	Name   string
	Public bool
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
	INSERT INTO paths (user_id, name, public) VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING id
	`, path.UserId, path.Name, path.Public)
	return err
}
