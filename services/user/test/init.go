package test

import (
	"context"
	"testing"

	"github.com/1001bit/pathgoer/services/user/otpstorage"
	"github.com/1001bit/pathgoer/services/user/refreshstorage"
	"github.com/1001bit/pathgoer/services/user/server"
	"github.com/1001bit/pathgoer/services/user/shared/amqpconn"
	"github.com/1001bit/pathgoer/services/user/shared/database"
	"github.com/1001bit/pathgoer/services/user/shared/testcontainer"
	"github.com/1001bit/pathgoer/services/user/usermodel"
)

func initServer(dbConnStr, amqpConnStr, refreshConnStr, otpConnStr string) (*server.Server, func()) {
	// start database
	dbConn := database.NewConn(dbConnStr)
	go dbConn.Connect()
	// models
	userstore := usermodel.NewUserStore(dbConn)

	// RabbitMQ connection
	amqpConn := amqpconn.New(amqpConnStr)
	go amqpConn.Connect()

	// refresh storage
	refreshStorage := refreshstorage.New(refreshConnStr)
	// otpStorage
	otpStorage := otpstorage.New(otpConnStr)

	// user server
	return server.New(userstore, otpStorage, refreshStorage, amqpConn), dbConn.Close
}

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

	// TODO: Test the server in all the ways:
	// Init rabbitMQ consumer (instead of email service)
	// Send email via server (test all the inputs)
	// Catch email from consumer
	// Login with OTP from email (test all the inputs)
	// Get profile
	// Refresh the tokens
	// Logout
	// Login again

	_ = server
	t.Skip("TestLoginFlow: TODO")
}
