package test

import (
	"context"
	"testing"

	"github.com/1001bit/pathgoer/services/path/server"
	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
)

func createPath(t *testing.T, ctx context.Context, s *server.Server) {
	originalPath := &pathpb.CreatePathRequest{
		UserId: 1,
		Name:   "test",
		Public: false,
	}
	_, err := s.CreatePath(ctx, originalPath)

	if err != nil {
		t.Fatal("Expected nil, got:", err)
	}
}
