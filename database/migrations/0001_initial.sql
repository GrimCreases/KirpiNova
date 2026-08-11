CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE app_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  password_hash text,
  email_verified_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locked', 'deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE encrypted_vault (
  user_id uuid PRIMARY KEY REFERENCES app_user(id) ON DELETE CASCADE,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  format_version integer NOT NULL CHECK (format_version > 0),
  encrypted_envelope text NOT NULL,
  envelope_bytes integer NOT NULL CHECK (envelope_bytes > 0 AND envelope_bytes <= 16777216),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE auth_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  token_hash bytea NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  user_agent_hash bytea
);

CREATE INDEX auth_session_user_id_idx ON auth_session(user_id);
CREATE INDEX auth_session_expires_at_idx ON auth_session(expires_at) WHERE revoked_at IS NULL;

CREATE TABLE encrypted_attachment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  vault_revision bigint NOT NULL,
  object_key text NOT NULL UNIQUE,
  encrypted_bytes bigint NOT NULL CHECK (encrypted_bytes > 0),
  content_hash bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX encrypted_attachment_user_id_idx ON encrypted_attachment(user_id);

COMMENT ON COLUMN encrypted_vault.encrypted_envelope IS 'Opaque client-encrypted account envelope. The server must never receive its plaintext or key.';
COMMENT ON COLUMN encrypted_attachment.object_key IS 'Private object-storage key for an encrypted attachment blob.';
