package main

import (
	"context"
	"testing"

	"github.com/1001bit/pathgoer/services/user/testcontainer"
)

func TestLoginFlow(t *testing.T) {
	ctx := context.Background()

	db, dbConnStr, err := testcontainer.StartPostgres(ctx, "../../sql/user-postgres.init.sql")
	if err != nil {
		t.Fatalf("failed to start postgres: %v", err)
	}

	otpRedis, otpRedisConnStr, err := testcontainer.StartRedis(ctx)
	if err != nil {
		t.Fatalf("failed to start redis: %v", err)
	}

	refreshRedis, refreshRedisConnStr, err := testcontainer.StartRedis(ctx)
	if err != nil {
		t.Fatalf("failed to start redis: %v", err)
	}

	rmq, rmqConnStr, err := testcontainer.StartRabbitMQ(ctx)
	if err != nil {
		t.Fatalf("failed to start rabbitmq: %v", err)
	}

	server, close := initServer(dbConnStr, rmqConnStr, refreshRedisConnStr, otpRedisConnStr)

	t.Cleanup(func() {
		if err := db.Terminate(ctx); err != nil {
			t.Errorf("failed to terminate postgres: %s", err)
		}

		if err := otpRedis.Terminate(ctx); err != nil {
			t.Errorf("failed to terminate redis: %s", err)
		}

		if err := refreshRedis.Terminate(ctx); err != nil {
			t.Errorf("failed to terminate redis: %s", err)
		}

		if err := rmq.Terminate(ctx); err != nil {
			t.Errorf("failed to terminate rabbitmq: %s", err)
		}

		close()
	})

	// TODO: Test the server in all the ways
	_ = server
	t.Skip("TestLoginFlow: TODO")
}
