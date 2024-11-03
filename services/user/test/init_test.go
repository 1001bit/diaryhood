package test

import (
	"context"
	"testing"

	"github.com/1001bit/pathgoer/services/user/otpstorage"
	"github.com/1001bit/pathgoer/services/user/refreshstorage"
	"github.com/1001bit/pathgoer/services/user/server"
	"github.com/1001bit/pathgoer/services/user/shared/postgresclient"
	"github.com/1001bit/pathgoer/services/user/shared/rabbitclient"
	"github.com/1001bit/pathgoer/services/user/shared/rabbitemail"
	"github.com/1001bit/pathgoer/services/user/shared/testcontainer/postgrestest"
	"github.com/1001bit/pathgoer/services/user/shared/testcontainer/rabbittest"
	"github.com/1001bit/pathgoer/services/user/shared/testcontainer/redistest"
	"github.com/1001bit/pathgoer/services/user/usermodel"
)

func initServer(postgresConnStr, rabbitConnStr, refreshConnStr, otpConnStr string) (*server.Server, func()) {
	// start database
	postgresC := postgresclient.New(postgresConnStr)
	// no goroutine, need to wait
	postgresC.Connect()
	// models
	userstore := usermodel.NewUserStore(postgresC)

	// RabbitMQ connection
	rabbitC := rabbitclient.New(rabbitConnStr)
	// no goroutine, need to wait
	rabbitC.Connect()

	// refresh storage
	refreshStorage := refreshstorage.New(refreshConnStr)
	// otpStorage
	otpStorage := otpstorage.New(otpConnStr)

	// user server
	return server.New(userstore, otpStorage, refreshStorage, rabbitC), func() {
		postgresC.Close()
		rabbitC.Close()
	}
}

func TestUserService(t *testing.T) {
	ctx := context.Background()

	postgres, postgresConnStr, err := postgrestest.StartContainer(ctx, "../../../sql/user-postgres.init.sql")
	if err != nil {
		t.Fatalf("failed to start postgres: %v", err)
	}

	otpRedis, otpRedisConnStr, err := redistest.StartContainer(ctx)
	if err != nil {
		t.Fatalf("failed to start redis: %v", err)
	}

	refreshRedis, refreshRedisConnStr, err := redistest.StartContainer(ctx)
	if err != nil {
		t.Fatalf("failed to start redis: %v", err)
	}

	rabbit, rabbitConnStr, err := rabbittest.StartContainer(ctx)
	if err != nil {
		t.Fatalf("failed to start rabbitmq: %v", err)
	}

	server, close := initServer(postgresConnStr, rabbitConnStr, refreshRedisConnStr, otpRedisConnStr)

	t.Cleanup(func() {
		if err := postgres.Terminate(ctx); err != nil {
			t.Errorf("failed to terminate postgres: %s", err)
		}

		if err := otpRedis.Terminate(ctx); err != nil {
			t.Errorf("failed to terminate redis: %s", err)
		}

		if err := refreshRedis.Terminate(ctx); err != nil {
			t.Errorf("failed to terminate redis: %s", err)
		}

		if err := rabbit.Terminate(ctx); err != nil {
			t.Errorf("failed to terminate rabbitmq: %s", err)
		}

		close()
	})

	// Init rabbitMQ consumer (instead of email service)
	rabbitC := rabbitclient.New(rabbitConnStr)
	rabbitC.Connect()
	emailChan := make(chan *rabbitemail.EmailBody, 1)
	ConsumeFromQueue(rabbitC, emailChan)

	testServer(t, ctx, server, emailChan)
}
