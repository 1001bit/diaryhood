package server

import (
	"context"

	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
)

func (s *Server) GetStats(ctx context.Context, req *pathpb.PathAccessRequest) (*pathpb.GetStatsResponse, error) {
	pathId, err := s.pathstore.GetPathId(ctx, req.PathName, req.UserId, req.AskerId)
	if err != nil {
		return nil, handleSqlError(err, "Failed to get path id")
	}

	stats, err := s.pathstore.GetStats(ctx, pathId)
	if err != nil {
		return nil, handleSqlError(err, "Failed to get stats")
	}

	return &pathpb.GetStatsResponse{
		Stats: ModelStatsToPb(stats),
	}, nil
}
