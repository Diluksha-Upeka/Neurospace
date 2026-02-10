import os

# This project talks to a local MinIO instance via explicit credentials.
# Some developer machines may have a malformed ~/.aws/config, which can cause
# boto3 to crash on import-time client creation. Default to ignoring shared AWS
# config/credentials files unless the user explicitly overrides these env vars.
os.environ.setdefault("AWS_SDK_LOAD_CONFIG", "0")
os.environ.setdefault("AWS_CONFIG_FILE", os.devnull)
os.environ.setdefault("AWS_SHARED_CREDENTIALS_FILE", os.devnull)
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("AWS_REGION", "us-east-1")

import boto3
from botocore.client import Config
from botocore.exceptions import EndpointConnectionError

from ..config import settings

class StorageService:
    def __init__(self):
        # Initialize the S3 Client
        self.s3 = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
        )
        self.bucket = settings.S3_BUCKET_NAME
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Creates the bucket if it doesn't exist."""
        try:
            self.s3.head_bucket(Bucket=self.bucket)
        except EndpointConnectionError as e:
            raise RuntimeError(
                f"Could not reach MinIO/S3 endpoint at {settings.S3_ENDPOINT_URL}. "
                "Make sure Docker Desktop is running and you've started infra with `docker compose up -d`."
            ) from e
        except:
            print(f" Creating bucket: {self.bucket}")
            self.s3.create_bucket(Bucket=self.bucket)

    def upload_file(self, file_path: str, object_name: str):
        """Uploads a local file to MinIO."""
        print(f" Uploading {object_name} to MinIO...")
        self.s3.upload_file(file_path, self.bucket, object_name)
        print(f" Upload successful: {object_name}")

    def download_file(self, object_name: str, download_path: str):
        """Downloads a file from MinIO to local disk."""
        self.s3.download_file(self.bucket, object_name, download_path)

# Singleton
_storage: StorageService | None = None


def get_storage() -> StorageService:
    global _storage
    if _storage is None:
        _storage = StorageService()
    return _storage