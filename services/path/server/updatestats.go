package server

import (
	"context"
	"database/sql"
	"log/slog"

	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) UpdateStats(ctx context.Context, req *pathpb.UpdateStatsRequest) (*pathpb.Empty, error) {
	pathId, err := s.pathstore.GetPathId(ctx, req.PathName, req.UserId, req.AskerId)
	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "not found")
	} else if err != nil {
		slog.With("err", err).Error("Failed to get path id")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	err = s.pathstore.UpdateStats(ctx, pathId, PbStatsToModel(req.Stats))
	if err != nil {
		slog.With("err", err).Error("Failed to update stats")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return &pathpb.Empty{}, nil
}
