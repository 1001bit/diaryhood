CREATE TABLE IF NOT EXISTS paths (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(31) NOT NULL,
    public BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT paths_userid_id_unique UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS stats (
    path_id INTEGER NOT NULL,
    name VARCHAR(31) NOT NULL,
    count INTEGER NOT NULL,
    step_equivalent INTEGER NOT NULL,

    PRIMARY KEY (path_id, name),
    CONSTRAINT stats_path_id_fkey FOREIGN KEY (path_id) REFERENCES paths (id) ON DELETE CASCADE
);