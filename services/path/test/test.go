package test

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/server/handler"
	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
)

func handleResults(code, wantedCode int, err error) error {
	if err != nil {
		return err
	}
	if code != wantedCode {
		return fmt.Errorf("expected status code %d, got %d", wantedCode, code)
	}
	return nil
}

func testServer(t *testing.T, ctx context.Context, client *HTTPClient) {
	jwt1, err := accesstoken.Generate("1")
	if err != nil {
		t.Fatalf("failed to generate jwt: %v", err)
	}
	jwt2, err := accesstoken.Generate("2")
	if err != nil {
		t.Fatalf("failed to generate jwt: %v", err)
	}
	client.SetJWT(jwt1)

	pathId := ""
	t.Run("create path", func(t *testing.T) {
		// bad inputs
		code, resp, err := client.CreatePath(ctx, handler.CreatePathRequest{
			Name: "special char",
		})
		if err = handleResults(code, http.StatusBadRequest, err); err != nil {
			t.Errorf("create path failed: %v", err)
		}

		code, resp, err = client.CreatePath(ctx, handler.CreatePathRequest{
			Name: "TooLongName111111111111111111111111111111",
		})
		if err = handleResults(code, http.StatusBadRequest, err); err != nil {
			t.Errorf("create path failed: %v", err)
		}

		// good inputs
		code, resp, err = client.CreatePath(ctx, handler.CreatePathRequest{
			Name: "path",
		})
		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Fatalf("create path failed: %v", err)
		}

		pathId = resp.Id
	})

	t.Run("fetch path by owner", func(t *testing.T) {
		// bad input
		code, resp, err := client.FetchPath(ctx, "a")
		if err = handleResults(code, http.StatusBadRequest, err); err != nil {
			t.Errorf("fetch path by owner failed: %v", err)
		}

		// good input
		code, resp, err = client.FetchPath(ctx, pathId)
		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Fatalf("fetch path by owner failed: %v", err)
		}
		if resp.Path.Name != "path" {
			t.Errorf("expected path name to be %s, got %s", "path", resp.Path.Name)
		}

		code, paths, err := client.FetchUserPaths(ctx, pathId)
		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Errorf("fetch user paths failed: %v", err)
		}
		if len(paths) != 1 {
			t.Errorf("expected 1 path, got %d", len(paths))
		}
		if paths[0].Name != "path" {
			t.Errorf("expected path name to be %s, got %s", "path", paths[0].Name)
		}
	})

	t.Run("fetch path by another user", func(t *testing.T) {
		client.SetJWT(jwt2)
		code, _, err := client.FetchPath(ctx, pathId)
		if err = handleResults(code, http.StatusNotFound, err); err != nil {
			t.Errorf("fetch path by another user failed: %v", err)
		}

		code, resp, err := client.FetchUserPaths(ctx, pathId)
		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Errorf("fetch user paths failed: %v", err)
		}
		if len(resp) != 0 {
			t.Errorf("expected 0 paths, got %d", len(resp))
		}
	})

	t.Run("update path by another user", func(t *testing.T) {
		code, err := client.UpdatePath(ctx, pathId, pathmodel.Path{
			Name:   "name",
			Public: true,
		})

		if err = handleResults(code, http.StatusNotFound, err); err != nil {
			t.Errorf("unauthorized update path failed: %v", err)
		}
	})

	t.Run("update path by owner", func(t *testing.T) {
		client.SetJWT(jwt1)
		code, err := client.UpdatePath(ctx, pathId, pathmodel.Path{
			Name:   "name2",
			Public: true,
		})

		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Errorf("update path failed: %v", err)
		}

		// bad inputs
		code, err = client.UpdatePath(ctx, pathId, pathmodel.Path{
			Name:   "TooLongName111111111111111111111111111111",
			Public: true,
		})
		if err = handleResults(code, http.StatusBadRequest, err); err != nil {
			t.Errorf("update path failed: %v", err)
		}

		code, err = client.UpdatePath(ctx, pathId, pathmodel.Path{
			Name:   "special char",
			Public: true,
		})
		if err = handleResults(code, http.StatusBadRequest, err); err != nil {
			t.Errorf("update path failed: %v", err)
		}
	})

	t.Run("create stat by owner", func(t *testing.T) {
		code, err := client.CreateStat(ctx, pathId, handler.CreateStatRequest{
			Name: "stat",
		})

		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Errorf("create stat failed: %v", err)
		}

		// bad inputs
		code, err = client.CreateStat(ctx, pathId, handler.CreateStatRequest{
			Name: "TooLongName111111111111111111111111111111",
		})
		if err = handleResults(code, http.StatusBadRequest, err); err != nil {
			t.Errorf("create stat failed: %v", err)
		}

		code, err = client.CreateStat(ctx, pathId, handler.CreateStatRequest{
			Name: "special char",
		})
		if err = handleResults(code, http.StatusBadRequest, err); err != nil {
			t.Errorf("create stat failed: %v", err)
		}
	})

	t.Run("update stat by owner", func(t *testing.T) {
		code, err := client.UpdateStat(ctx, pathId, "stat", pathmodel.CountlessStat{
			Name:           "stat2",
			StepEquivalent: 1,
		})
		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Errorf("update stat failed: %v", err)
		}

		// bad inputs
		code, err = client.UpdateStat(ctx, pathId, "stat", pathmodel.CountlessStat{
			Name:           "TooLongName111111111111111111111111111111",
			StepEquivalent: 1,
		})
		if err = handleResults(code, http.StatusBadRequest, err); err != nil {
			t.Errorf("update stat failed: %v", err)
		}

		code, err = client.UpdateStat(ctx, pathId, "stat", pathmodel.CountlessStat{
			Name:           "special char",
			StepEquivalent: 1,
		})
		if err = handleResults(code, http.StatusBadRequest, err); err != nil {
			t.Errorf("update stat failed: %v", err)
		}
	})

	t.Run("create duplicate stat", func(t *testing.T) {
		code, err := client.CreateStat(ctx, pathId, handler.CreateStatRequest{
			Name: "stat2",
		})
		if err = handleResults(code, http.StatusConflict, err); err != nil {
			t.Errorf("create stat failed: %v", err)
		}
	})

	t.Run("create stat by another user", func(t *testing.T) {
		client.SetJWT(jwt2)
		code, err := client.CreateStat(ctx, pathId, handler.CreateStatRequest{
			Name: "stat",
		})
		if err = handleResults(code, http.StatusNotFound, err); err != nil {
			t.Errorf("create stat failed: %v", err)
		}
	})

	t.Run("update stat by another user", func(t *testing.T) {
		client.SetJWT(jwt2)
		code, err := client.UpdateStat(ctx, pathId, "stat2", pathmodel.CountlessStat{
			Name:           "stat31",
			StepEquivalent: 1,
		})
		if err = handleResults(code, http.StatusNotFound, err); err != nil {
			t.Errorf("update stat failed: %v", err)
		}
	})

	t.Run("fetch path by both", func(t *testing.T) {
		client.SetJWT(jwt1)
		code, resp, err := client.FetchPath(ctx, pathId)
		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Errorf("fetch path failed: %v", err)
		}

		if !resp.EditRight {
			t.Errorf("fetch path failed: not edit right")
		}

		client.SetJWT(jwt2)
		code, resp, err = client.FetchPath(ctx, pathId)
		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Fatalf("fetch path failed: %v", err)
		}
		if resp.EditRight {
			t.Errorf("fetch path failed: edit right")
		}

		if resp.Path.Name != "name2" {
			t.Errorf("Wanted path name to be %s, got %s", "name2", resp.Path.Name)
		}

		if len(resp.Path.Stats) != 1 {
			t.Errorf("Wanted path stats to be %d, got %d", 1, len(resp.Path.Stats))
		}

		if resp.Path.Stats[0].Name != "stat2" {
			t.Errorf("Wanted stat name to be %s, got %s", "stat2", resp.Path.Stats[0].Name)
		}

		if resp.Path.Stats[0].StepEquivalent != 1 {
			t.Errorf("Wanted stat step equivalent to be %d, got %d", 1, resp.Path.Stats[0].StepEquivalent)
		}
	})

	t.Run("delete stat by another user", func(t *testing.T) {
		code, err := client.DeleteStat(ctx, pathId, "stat2")
		if err = handleResults(code, http.StatusNotFound, err); err != nil {
			t.Errorf("delete stat failed: %v", err)
		}
	})

	t.Run("delete stat by owner", func(t *testing.T) {
		client.SetJWT(jwt1)
		code, err := client.DeleteStat(ctx, pathId, "stat2")
		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Errorf("delete stat failed: %v", err)
		}
	})

	t.Run("delete path by another user", func(t *testing.T) {
		client.SetJWT(jwt2)
		code, err := client.DeletePath(ctx, pathId)
		if err = handleResults(code, http.StatusNotFound, err); err != nil {
			t.Errorf("delete path failed: %v", err)
		}
	})

	t.Run("delete path by owner", func(t *testing.T) {
		client.SetJWT(jwt1)
		code, err := client.DeletePath(ctx, pathId)
		if err = handleResults(code, http.StatusOK, err); err != nil {
			t.Errorf("delete path failed: %v", err)
		}
	})
}
