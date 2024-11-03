package test

import (
	"context"
	"testing"

	"github.com/1001bit/pathgoer/services/path/server"
	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
)

func testServer(t *testing.T, ctx context.Context, server *server.Server) {
	// Create path
	originalPath := &pathpb.CreatePathRequest{
		UserId: 1,
		Name:   "test",
		Public: false,
	}
	_, err := server.CreatePath(ctx, originalPath)

	if err != nil {
		t.Fatal("Expected nil, got:", err)
	}
}
