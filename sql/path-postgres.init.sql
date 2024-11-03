CREATE TABLE IF NOT EXISTS paths (
    id SERIAL PRIMARY KEY,
    user_id SERIAL NOT NULL,
    name VARCHAR(255) NOT NULL,
    public BOOLEAN NOT NULL,
    steps INT NOT NULL,
    other_stats JSONB NOT NULL
);

-- Make ownerId and id pair unique
CREATE UNIQUE INDEX IF NOT EXISTS paths_userid_id_unique ON paths (user_id, id)