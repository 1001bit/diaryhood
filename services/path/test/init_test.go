package test

import (
	"context"
	"testing"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/server"
	"github.com/1001bit/pathgoer/services/path/shared/postgresclient"
	"github.com/1001bit/pathgoer/services/path/shared/testcontainer/postgrestest"
)

func initServer(dbConnStr string) (*server.Server, func()) {
	// start database
	postrgesC := postgresclient.New(dbConnStr)
	postrgesC.Connect()
	// models
	pathstore := pathmodel.NewPathStore(postrgesC)

	// user server
	return server.New(pathstore), func() {
		postrgesC.Close()
	}
}

func TestPathService(t *testing.T) {
	ctx := context.Background()

	postgresContainer, dbConnStr, err := postgrestest.StartContainer(ctx, "../../../sql/path-postgres.init.sql")
	if err != nil {
		t.Fatalf("failed to start postgres: %v", err)
	}

	server, close := initServer(dbConnStr)
	t.Cleanup(func() {
		if err := postgresContainer.Terminate(ctx); err != nil {
			t.Errorf("failed to terminate postgres: %s", err)
		}
		close()
	})

	createPath(t, ctx, server)
	createStats(t, ctx, server)
	updateStats(t, ctx, server)
}
