CREATE TABLE IF NOT EXISTS paths (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(31) NOT NULL,
    public BOOLEAN NOT NULL DEFAULT false,
    
    CONSTRAINT paths_userid_name_unique UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS stats (
    path_id INTEGER NOT NULL,
    name VARCHAR(31) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    step_equivalent INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (path_id, name),
    CONSTRAINT stats_path_id_fkey 
        FOREIGN KEY (path_id) 
        REFERENCES paths (id) 
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quotas (
    path_id INTEGER NOT NULL,
    stat_name VARCHAR(31) NOT NULL,

    quota INTEGER NOT NULL DEFAULT 1,
    last_count INTEGER NOT NULL DEFAULT 0,

    last_done TIMESTAMP NOT NULL DEFAULT now(),
    duration_hours INTEGER NOT NULL DEFAULT 24,

    streak INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (path_id, stat_name),
    CONSTRAINT quotas_stats_fkey 
        FOREIGN KEY (path_id, stat_name) 
        REFERENCES stats (path_id, name) 
        ON DELETE CASCADE
);