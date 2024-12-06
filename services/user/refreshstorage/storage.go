package refreshstorage

import (
	"context"
	"time"

	"github.com/1001bit/pathgoer/services/user/shared/redisclient"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

const expiration = 30 * 24 * time.Hour

type Storage struct {
	redisClient *redis.Client
}

func New(connStr string) *Storage {
	return &Storage{
		redisClient: redisclient.New(connStr),
	}
}

func (r *Storage) GetUserIDAndRefresh(ctx context.Context, uuid string) (string, string, error) {
	userID, err := r.redisClient.Get(ctx, uuidKey(uuid)).Result()
	if err != nil {
		return "", "", err
	}
	// rotate token
	err = r.DeleteUUID(ctx, uuid)
	if err != nil {
		return "", "", err
	}

	newUUID, err := r.GenerateUUID(ctx, userID)
	return userID, newUUID, err
}

func (r *Storage) GenerateUUID(ctx context.Context, userID string) (string, error) {
	uuid := uuid.NewString()

	return uuid, r.redisClient.Set(ctx, uuidKey(uuid), userID, expiration).Err()
}

func (r *Storage) DeleteUUID(ctx context.Context, uuid string) error {
	return r.redisClient.Del(ctx, uuidKey(uuid)).Err()
}

func uuidKey(uuid string) string {
	return "uuid:" + uuid
}
