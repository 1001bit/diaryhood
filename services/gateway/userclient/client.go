package userclient

import (
	"github.com/1001bit/pathgoer/services/gateway/shared/userpb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Client struct {
	conn          *grpc.ClientConn
	serviceClient userpb.UserServiceClient
}

func New(addr string) (*Client, error) {
	// INSECURE
	conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	return &Client{
		conn:          conn,
		serviceClient: userpb.NewUserServiceClient(conn),
	}, nil
}

func (c *Client) Close() error {
	return c.conn.Close()
}

func (c *Client) Target() string {
	return c.conn.Target()
}
