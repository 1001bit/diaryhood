package server

import (
	"context"

	"github.com/1001bit/pathgoer/services/user/usermodel"
	"github.com/1001bit/pathgoer/services/user/userpb"
)

type UserStorage interface {
	GetCredentials(ctx context.Context, login string) (*usermodel.Credentials, error)
	GetProfile(ctx context.Context, name string) (*usermodel.Profile, error)
	GetNameAndIdByEmail(ctx context.Context, email string) (string, string, error)
	GetNameByID(ctx context.Context, id string) (string, error)
}

type OtpStorage interface {
	GenerateOTP(ctx context.Context, email string) (string, error)
	VerifyOTP(ctx context.Context, email, otp string) bool
}

type RefreshStorage interface {
	GenerateUUID(ctx context.Context, userID string) (string, error)
	DeleteUUID(ctx context.Context, uuid string) error
	GetUserIDAndRefresh(ctx context.Context, uuid string) (string, string, error)
}

type QueuePublisher interface {
	Publish(queueName string, body string) error
}

type Server struct {
	userpb.UnimplementedUserServiceServer

	userStore      UserStorage
	otpStorage     OtpStorage
	refreshStorage RefreshStorage
	publisher      QueuePublisher
}

func New(userStore UserStorage, otpStorage OtpStorage, refreshStorage RefreshStorage, publisher QueuePublisher) *Server {
	return &Server{
		userStore:      userStore,
		otpStorage:     otpStorage,
		refreshStorage: refreshStorage,
		publisher:      publisher,
	}
}
