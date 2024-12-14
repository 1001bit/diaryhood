package test

import (
	"context"
	"fmt"
	"net/http"
	"testing"

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
	_ = jwt2

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
	})

	t.Run("fetch path by another user", func(t *testing.T) {
		client.SetJWT(jwt2)
		code, _, err := client.FetchPath(ctx, pathId)
		if err = handleResults(code, http.StatusNotFound, err); err != nil {
			t.Errorf("fetch path by another user failed: %v", err)
		}
	})

	// TODO:
	// Update path: Visibility, name, stepeq
	// Create stats, update stat, delete stat
	// Fetch path by: Owner, Another user
	// Delete Path
}
