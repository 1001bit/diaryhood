package test

import (
	"context"
	"testing"

	"github.com/1001bit/pathgoer/services/path/server"
	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
)

func testServer(t *testing.T, ctx context.Context, server *server.Server) {
	// Create path
	_, err := server.CreatePath(ctx, &pathpb.CreatePathRequest{
		Id:     1,
		UserId: 1,
		Name:   "test",
		Public: true,
		Steps:  1,
		OtherStats: map[string]int32{
			"test": 1,
		},
	})

	if err != nil {
		t.Fatal("Expected nil, got:", err)
	}
}
