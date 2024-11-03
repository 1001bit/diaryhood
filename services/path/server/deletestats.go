package server

import (
	"context"

	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
)

func (s *Server) DeleteStats(ctx context.Context, req *pathpb.DeleteStatsRequest) (*pathpb.Empty, error) {
	pathId, err := s.pathstore.GetPathId(ctx, req.Access.PathName, req.Access.UserId, req.Access.AskerId)
	if err != nil {
		return nil, handleSqlError(err, "Failed to get path id")
	}

	err = s.pathstore.DeleteStats(ctx, pathId, req.StatNames)
	if err != nil {
		return nil, handleSqlError(err, "Failed to delete stats")
	}

	return &pathpb.Empty{}, nil
}
