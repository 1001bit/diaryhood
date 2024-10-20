package main

import (
	"fmt"
	"log"
	"net"
	"os"

	"github.com/1001bit/pathgoer/services/user/database"
	"github.com/1001bit/pathgoer/services/user/emailpb"
	"github.com/1001bit/pathgoer/services/user/grpcclient"
	"github.com/1001bit/pathgoer/services/user/otp"
	"github.com/1001bit/pathgoer/services/user/refresh"
	"github.com/1001bit/pathgoer/services/user/server"
	"github.com/1001bit/pathgoer/services/user/usermodel"
	"github.com/1001bit/pathgoer/services/user/userpb"
	"google.golang.org/grpc"
)

func main() {
	// start database
	db, err := database.NewFromEnv()
	if err != nil {
		log.Fatal("err starting database:", err)
	}
	defer db.Close()

	// models
	userstore := usermodel.NewUserStore(db)

	// emailclient
	conn, err := grpcclient.New(os.Getenv("EMAIL_HOST"), os.Getenv("PORT"))
	if err != nil {
		log.Fatal(err)
	}
	emailclient := emailpb.NewEmailServiceClient(conn)
	log.Println("emailclient connected on " + os.Getenv("EMAIL_HOST") + ":" + os.Getenv("PORT"))

	// otpStorage
	otpStorage := otp.NewStorage(os.Getenv("OTP_REDIS_HOST"), os.Getenv("REDIS_PORT"))
	log.Println("otpStorage connected on " + os.Getenv("OTP_REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"))

	// refresh storage
	refreshStorage := refresh.NewStorage(os.Getenv("REFRESH_REDIS_HOST"), os.Getenv("REDIS_PORT"))
	log.Println("refreshStorage connected on " + os.Getenv("REFRESH_REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"))

	// start tcp listener
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("PORT")))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// create grpc server
	grpcServer := grpc.NewServer()
	userpb.RegisterUserServiceServer(grpcServer, server.New(userstore, otpStorage, refreshStorage, emailclient))

	log.Println("gRPC server listening on", lis.Addr())
	log.Fatal(grpcServer.Serve(lis))
}
