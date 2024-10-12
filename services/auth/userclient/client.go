package userclient

import (
	"fmt"

	"github.com/1001bit/pathgoer/services/auth/userpb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Client struct {
	userpb.UserServiceClient
}

func New(host, port string) (*Client, error) {
	addr := fmt.Sprintf("%s:%s", host, port)

	conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	return &Client{
		UserServiceClient: userpb.NewUserServiceClient(conn),
	}, nil
}
