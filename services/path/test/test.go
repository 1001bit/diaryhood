package test

import (
	"context"
	"net/http"
	"testing"

	"github.com/1001bit/pathgoer/services/path/server/handler"
	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
)

func handleResults(t *testing.T, ctx context.Context, code, wantedCode int, err error) {
	if err != nil {
		t.Fatalf("failed to create path: %v", err)
	}
	if code != wantedCode {
		t.Errorf("expected status code %d, got %d", wantedCode, code)
	}
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

	t.Run("create path", func(t *testing.T) {
		// bad inputs
		code, err := client.CreatePath(ctx, handler.CreatePathRequest{
			Name: "special char",
		})
		handleResults(t, ctx, code, http.StatusBadRequest, err)

		code, err = client.CreatePath(ctx, handler.CreatePathRequest{
			Name: "TooLongName111111111111111111111111111111",
		})
		handleResults(t, ctx, code, http.StatusBadRequest, err)

		// good inputs
		code, err = client.CreatePath(ctx, handler.CreatePathRequest{
			Name: "path",
		})
		handleResults(t, ctx, code, http.StatusOK, err)
	})

	// TODO:
	// Fetch path by: Owner, Another user
	// Update path: Visibility, name, stepeq
	// Create stats, update stat, delete stat
	// Fetch path by: Owner, Another user
	// Delete Path
}
