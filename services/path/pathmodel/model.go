package pathmodel

import (
	"errors"

	"github.com/1001bit/pathgoer/services/path/shared/database"
)

var ErrNoDB = errors.New("no database connection")

type PathStore struct {
	dbConn *database.Conn
}

func NewPathStore(dbConn *database.Conn) *PathStore {
	return &PathStore{
		dbConn: dbConn,
	}
}
