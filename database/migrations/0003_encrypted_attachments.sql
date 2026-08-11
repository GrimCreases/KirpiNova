ALTER TABLE encrypted_attachment
  ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready')),
  ADD COLUMN completed_at timestamptz;

CREATE INDEX encrypted_attachment_pending_idx ON encrypted_attachment(created_at) WHERE status = 'pending';
