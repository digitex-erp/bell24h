import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const DEFAULT_BUCKET = process.env.AWS_S3_BUCKET_NAME;

export async function uploadToS3(key: string, body: Buffer | string, bucket: string = DEFAULT_BUCKET) {
  if (!bucket) {
    throw new Error('AWS S3 bucket name is not configured. Set AWS_S3_BUCKET_NAME in .env or pass bucket parameter.');
  }
  return s3.upload({ Bucket: bucket, Key: key, Body: body }).promise();
}

export async function downloadFromS3(key: string, bucket: string = DEFAULT_BUCKET) {
  if (!bucket) {
    throw new Error('AWS S3 bucket name is not configured. Set AWS_S3_BUCKET_NAME in .env or pass bucket parameter.');
  }
  const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  return data.Body;
}

export async function deleteFromS3(key: string, bucket: string = DEFAULT_BUCKET) {
  if (!bucket) {
    throw new Error('AWS S3 bucket name is not configured. Set AWS_S3_BUCKET_NAME in .env or pass bucket parameter.');
  }
  return s3.deleteObject({ Bucket: bucket, Key: key }).promise();
}

// Usage Example (remove in production):
// Ensure AWS_S3_BUCKET_NAME is set in your .env file or pass the bucket name explicitly.
// Example assuming AWS_S3_BUCKET_NAME is set:
// uploadToS3('test.txt', 'Hello World');
// downloadFromS3('test.txt');
// deleteFromS3('test.txt');

// Example with explicit bucket name:
// uploadToS3('explicit-bucket-name', 'test.txt', 'Hello World From Explicit Bucket');
