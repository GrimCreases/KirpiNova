# Private encrypted attachment storage

KirpiNova supports S3-compatible storage such as Cloudflare R2, Backblaze B2, AWS S3, or a private MinIO service.

## Security boundary

The browser encrypts every file with the unlocked vault key before upload. Object storage receives:

- a random object key;
- an opaque `application/octet-stream` blob;
- its encrypted byte count;
- a SHA-256 checksum of the ciphertext.

Filenames, original MIME types, document titles, categories, notes, and plaintext file contents remain inside the encrypted account vault.

## Required environment variables

```text
S3_ENDPOINT=https://your-s3-compatible-endpoint
S3_REGION=auto
S3_BUCKET=kirpinova-private
S3_ACCESS_KEY_ID=replace-in-coolify
S3_SECRET_ACCESS_KEY=replace-in-coolify
S3_FORCE_PATH_STYLE=true
```

Store these only in Coolify secrets. Use a dedicated bucket and credentials limited to that bucket.

## Bucket policy

Keep the bucket private. Do not enable public reads or directory listing. KirpiNova generates five-minute signed URLs only after confirming the authenticated account owns the attachment record.

## CORS

The browser uploads ciphertext directly using a signed URL. Allow the KirpiNova production origin to use `PUT` and `GET`, and allow these request headers:

```text
content-type
x-amz-meta-ciphertextsha256
```

Do not use `*` as the allowed production origin when the storage provider supports an explicit origin.

## Deployment verification

1. Upload an image from Documents.
2. Confirm the object is private and ends in `.bin`.
3. Confirm the object cannot be opened without a signed URL.
4. Open the document from a fresh signed-in browser, unlock the vault, and decrypt the image.
5. Change one byte in a downloaded test object and confirm decryption fails.
6. Delete the document and confirm the object is removed.

These checks require real object-storage credentials and cannot be completed by the local build alone.
