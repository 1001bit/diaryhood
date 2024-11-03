package test

import (
	"context"
	"testing"

	"github.com/1001bit/pathgoer/services/path/server"
	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func compareServerStatsToLocal(ctx context.Context, s *server.Server, localStats []*pathpb.Stat) (bool, error) {
	stats, err := s.GetStats(ctx, &pathpb.PathAccessRequest{
		UserId:   1,
		PathName: "test",
		AskerId:  1,
	})
	if err != nil {
		return false, err
	}

	if len(stats.Stats) != len(localStats) {
		return false, nil
	}

	dbStatsModel := server.PbStatsToModel(stats.Stats)
	testStatsModel := server.PbStatsToModel(localStats)
	for i := range len(localStats) {
		if dbStatsModel[i] != testStatsModel[i] {
			return false, nil
		}
	}

	return true, nil
}

func createStats(t *testing.T, ctx context.Context, s *server.Server) {
	testStats := []*pathpb.Stat{
		{
			Name:           "test",
			Count:          1,
			StepEquivalent: 1,
		},
	}

	// Another user tries to access private path
	_, err := s.UpdateStats(ctx, &pathpb.UpdateStatsRequest{
		Access: &pathpb.PathAccessRequest{
			UserId:   1,
			PathName: "unknown",
			AskerId:  2,
		},
		Stats: testStats,
	})
	if status.Code(err) != codes.NotFound {
		t.Fatal("Expected not found, got:", err)
	}

	// Unknown path name
	_, err = s.UpdateStats(ctx, &pathpb.UpdateStatsRequest{
		Access: &pathpb.PathAccessRequest{
			UserId:   1,
			PathName: "unknown",
			AskerId:  1,
		},
		Stats: testStats,
	})
	if status.Code(err) != codes.NotFound {
		t.Fatal("Expected not found, got:", err)
	}

	// Good
	_, err = s.UpdateStats(ctx, &pathpb.UpdateStatsRequest{
		Access: &pathpb.PathAccessRequest{
			UserId:   1,
			PathName: "test",
			AskerId:  1,
		},
		Stats: testStats,
	})
	if err != nil {
		t.Fatal("Expected nil, got:", err)
	}

	// Compare stats from db and local stats
	same, err := compareServerStatsToLocal(ctx, s, testStats)
	if err != nil {
		t.Fatal("Expected nil, got:", err)
	}
	if !same {
		t.Fatal("stats not equal")
	}
}

func updateStats(t *testing.T, ctx context.Context, s *server.Server) {
	testStats := []*pathpb.Stat{
		{
			Name:           "test",
			Count:          2,
			StepEquivalent: 1,
		},
	}

	// Update stats
	_, err := s.UpdateStats(ctx, &pathpb.UpdateStatsRequest{
		Access: &pathpb.PathAccessRequest{
			UserId:   1,
			PathName: "test",
			AskerId:  1,
		},
		Stats: testStats,
	})
	if err != nil {
		t.Fatal("Expected nil, got:", err)
	}

	// Compare stats from db and local stats
	same, err := compareServerStatsToLocal(ctx, s, testStats)
	if err != nil {
		t.Fatal("Expected nil, got:", err)
	}
	if !same {
		t.Fatal("stats not equal")
	}

	// Delete stats
	_, err = s.DeleteStats(ctx, &pathpb.DeleteStatsRequest{
		Access: &pathpb.PathAccessRequest{
			UserId:   1,
			PathName: "test",
			AskerId:  1,
		},
		StatNames: []string{"test"},
	})
	if err != nil {
		t.Fatal("Expected nil, got:", err)
	}

	// Compare stats from db and local stats
	same, err = compareServerStatsToLocal(ctx, s, []*pathpb.Stat{})
	if err != nil {
		t.Fatal("Expected nil, got:", err)
	}
	if !same {
		t.Fatal("stats not equal")
	}
}
