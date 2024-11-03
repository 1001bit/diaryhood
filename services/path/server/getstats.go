package server

import (
	"context"
	"database/sql"
	"log/slog"

	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) GetStats(ctx context.Context, req *pathpb.GetStatsRequest) (*pathpb.GetStatsResponse, error) {
	pathId, err := s.pathstore.GetPathId(ctx, req.PathName, req.UserId, req.AskerId)
	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "not found")
	} else if err != nil {
		slog.With("err", err).Error("Failed to get path id")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	stats, err := s.pathstore.GetStats(ctx, pathId)
	if err == sql.ErrNoRows {
		return nil, status.Error(codes.NotFound, "not found")
	} else if err != nil {
		slog.With("err", err).Error("Failed to get stats")
		return nil, status.Error(codes.Internal, "an error occurred")
	}

	return &pathpb.GetStatsResponse{
		Stats: ModelStatsToPb(stats),
	}, nil
}
