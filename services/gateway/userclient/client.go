package userclient

import (
	"fmt"

	"github.com/1001bit/pathgoer/services/gateway/userpb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Client struct {
	userpb.UserServiceClient
}

func MustNew(host, port string) *Client {
	addr := fmt.Sprintf("%s:%s", host, port)

	conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		panic(err)
	}

	return &Client{
		UserServiceClient: userpb.NewUserServiceClient(conn),
	}
}
