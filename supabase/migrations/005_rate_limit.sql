-- Simple DB-backed rate limiting (shared across serverless instances)
-- Keyed by a string like: "ip:1.2.3.4:/api/auth/login" or "user:<id>:/api/upload"

CREATE TABLE IF NOT EXISTS api_rate_limits (
  key TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON api_rate_limits (window_start);

CREATE OR REPLACE FUNCTION check_rate_limit(p_key TEXT, p_limit INT, p_window_seconds INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  now_ts TIMESTAMPTZ := now();
  win_start TIMESTAMPTZ := date_trunc('second', now_ts) - (EXTRACT(EPOCH FROM now_ts)::INT % p_window_seconds) * INTERVAL '1 second';
BEGIN
  INSERT INTO api_rate_limits (key, window_start, count, updated_at)
  VALUES (p_key, win_start, 1, now_ts)
  ON CONFLICT (key) DO UPDATE
  SET
    -- if we're still in the same window, increment; otherwise reset
    window_start = CASE WHEN api_rate_limits.window_start = win_start THEN api_rate_limits.window_start ELSE win_start END,
    count = CASE WHEN api_rate_limits.window_start = win_start THEN api_rate_limits.count + 1 ELSE 1 END,
    updated_at = now_ts;

  RETURN (SELECT count <= p_limit FROM api_rate_limits WHERE key = p_key);
END;
$$;

