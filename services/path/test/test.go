package test

import (
	"context"
	"net/http"
	"testing"

	"github.com/1001bit/pathgoer/services/path/server/handler"
	"github.com/1001bit/pathgoer/services/path/shared/accesstoken"
)

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
		code, err := client.CreatePath(ctx, handler.CreatePathRequest{
			Name: "special char",
		})
		if err != nil {
			t.Fatalf("failed to create path: %v", err)
		}

		if code != http.StatusBadRequest {
			t.Errorf("expected status code %d, got %d", http.StatusBadRequest, code)
		}

		code, err = client.CreatePath(ctx, handler.CreatePathRequest{
			Name: "TooLongName111111111111111111111111111111",
		})
		if err != nil {
			t.Fatalf("failed to create path: %v", err)
		}

		if code != http.StatusBadRequest {
			t.Errorf("expected status code %d, got %d", http.StatusBadRequest, code)
		}

		code, err = client.CreatePath(ctx, handler.CreatePathRequest{
			Name: "path",
		})
		if err != nil {
			t.Fatalf("failed to create path: %v", err)
		}

		if code != http.StatusOK {
			t.Errorf("expected status code %d, got %d", http.StatusOK, code)
		}
	})
}
