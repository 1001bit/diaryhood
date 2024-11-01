package otpstorage

import (
	"context"
	"crypto/rand"
	"fmt"
	"log/slog"
	"math/big"
	"time"

	"github.com/redis/go-redis/v9"
)

const expiration = 5 * time.Minute

type Storage struct {
	redisClient *redis.Client
}

func New(host, port string) *Storage {
	connStr := fmt.Sprintf("%s:%s", host, port)
	slog.With("addr", connStr).Info("Connecting to Redis")
	return &Storage{
		redisClient: redis.NewClient(&redis.Options{
			Addr: connStr,
		}),
	}
}

func (s *Storage) VerifyOTP(ctx context.Context, email, otp string) bool {
	resOtp, err := s.redisClient.Get(ctx, "email:"+email).Result()
	if err != nil || resOtp != otp {
		return false
	}

	s.redisClient.Del(ctx, email).Err()
	return true
}

func (s *Storage) GenerateOTP(ctx context.Context, email string) (string, error) {
	otp, err := generateOTP()
	if err != nil {
		return "", err
	}

	return otp, s.redisClient.Set(ctx, "email:"+email, otp, expiration).Err()
}

func generateOTP() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(999999)) // Generates a 6-digit OTP
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n), nil
}
