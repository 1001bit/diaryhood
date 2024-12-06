package otpstorage

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"github.com/1001bit/pathgoer/services/user/shared/redisclient"
	"github.com/redis/go-redis/v9"
)

const expiration = 5 * time.Minute

type Storage struct {
	redisClient *redis.Client
}

func New(connStr string) *Storage {
	return &Storage{
		redisClient: redisclient.New(connStr),
	}
}

func (s *Storage) VerifyOTP(ctx context.Context, email, otp string) (bool, error) {
	resOtp, err := s.redisClient.Get(ctx, emailKey(email)).Result()

	if err != nil || resOtp != otp {
		return false, err
	}

	err = s.redisClient.Del(ctx, emailKey(email)).Err()
	if err != nil {
		return false, err
	}

	return true, nil
}

func (s *Storage) GenerateOTP(ctx context.Context, email string) (string, error) {
	otp, err := generateOTP()
	if err != nil {
		return "", err
	}

	return otp, s.redisClient.Set(ctx, emailKey(email), otp, expiration).Err()
}

func generateOTP() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(999999)) // Generates a 6-digit OTP
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n), nil
}

func emailKey(email string) string {
	return "email:" + email
}
