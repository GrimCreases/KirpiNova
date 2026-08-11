CREATE TABLE auth_token (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('verify_email', 'reset_password')),
  token_hash bytea NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  consumed_at timestamptz
);

CREATE INDEX auth_token_user_purpose_idx ON auth_token(user_id, purpose) WHERE consumed_at IS NULL;
CREATE INDEX auth_token_expires_at_idx ON auth_token(expires_at) WHERE consumed_at IS NULL;

ALTER TABLE app_user ADD CONSTRAINT app_user_password_hash_required CHECK (status = 'deleted' OR password_hash IS NOT NULL) NOT VALID;

CREATE TABLE auth_attempt (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope text NOT NULL CHECK (scope IN ('email', 'address')),
  key_hash bytea NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_attempt_lookup_idx ON auth_attempt(scope, key_hash, attempted_at DESC);