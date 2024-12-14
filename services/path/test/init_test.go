package test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/server"
	"github.com/1001bit/pathgoer/services/path/shared/postgresclient"
	"github.com/1001bit/pathgoer/services/path/shared/testcontainer/postgrestest"
)

func initServer(postgresConnStr string) (*server.Server, func()) {
	// start database
	postgresC := postgresclient.New(postgresConnStr)
	// no goroutine, need to wait
	postgresC.Connect()
	// models
	pathstore := pathmodel.NewPathStore(postgresC)

	// user server
	return server.New(pathstore), func() {
		postgresC.Close()
	}
}

func TestPathService(t *testing.T) {
	ctx := context.Background()

	postgres, postgresConnStr, err := postgrestest.StartContainer(ctx, "../../../sql/path-postgres.init.sql")
	if err != nil {
		t.Fatalf("failed to start postgres: %v", err)
	}

	server, close := initServer(postgresConnStr)
	port := "8083"
	go func() {
		err := server.ListenAndServe(port)
		if err != nil {
			t.Errorf("failed to start server: %s", err)
		}
	}()

	time.Sleep(time.Second)

	client := NewHTTPClient(fmt.Sprintf("http://localhost:%s", port))

	t.Cleanup(func() {
		if err := postgres.Terminate(ctx); err != nil {
			t.Errorf("failed to terminate postgres: %s", err)
		}

		close()
	})

	testServer(t, ctx, client)
}
