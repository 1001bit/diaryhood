package server

import (
	"context"

	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
)

func (s *Server) UpdateStats(ctx context.Context, req *pathpb.UpdateStatsRequest) (*pathpb.Empty, error) {
	pathId, err := s.pathstore.GetPathId(ctx, req.Access.PathName, req.Access.UserId, req.Access.AskerId)
	if err != nil {
		return nil, handleSqlError(err, "Failed to get path id")
	}

	err = s.pathstore.UpdateStats(ctx, pathId, PbStatsToModel(req.Stats))
	if err != nil {
		return nil, handleSqlError(err, "Failed to get update stats")
	}

	return &pathpb.Empty{}, nil
}
