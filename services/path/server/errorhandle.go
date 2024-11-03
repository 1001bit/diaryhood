package server

import (
	"database/sql"
	"log/slog"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func handleSqlError(err error, errMsg string) error {
	if err == sql.ErrNoRows {
		return status.Error(codes.NotFound, "not found")
	} else {
		slog.With("err", err).Error(errMsg)
		return status.Error(codes.Internal, "something went wrong")
	}
}
