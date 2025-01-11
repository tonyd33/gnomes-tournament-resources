resource "aws_s3_bucket" "recordings" {
  bucket = "rtmp-recordings-bucket"

  website {
    index_document = "index.html" # Optional, not needed for direct file access
    error_document = "error.html" # Optional
  }

  versioning {
    enabled = true
  }

  # don't let me idiot
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_ownership_controls" "recordings_ownership_controls" {
  bucket = aws_s3_bucket.recordings.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "recordings_block" {
  bucket                  = aws_s3_bucket.recordings.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "recordings_acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.recordings_ownership_controls,
    aws_s3_bucket_public_access_block.recordings_block,
  ]

  bucket = aws_s3_bucket.recordings.id
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "recordings_policy" {
  bucket = aws_s3_bucket.recordings.id

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Sid" : "PublicReadGetObject",
        "Effect" : "Allow",
        "Principal" : "*",
        "Action" : "s3:GetObject",
        "Resource" : "${aws_s3_bucket.recordings.arn}/*"
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.recordings_block,
  ]
}

resource "aws_iam_user" "rtmp_user" {
  name = "rtmp-user"
}

resource "aws_iam_access_key" "rtmp_access_key" {
  user = aws_iam_user.rtmp_user.name
}

resource "aws_iam_user_policy_attachment" "attach_user_policy" {
  user       = aws_iam_user.rtmp_user.name
  policy_arn = aws_iam_policy.upload_policy.arn
}

resource "aws_iam_role" "rtmp_role" {
  name = "RTMPServerRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "upload_policy" {
  name = "S3AccessPolicy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["s3:PutObject", "s3:ListBucket", "s3:GetObject"],
        Effect = "Allow",
        Resource = [
          "${aws_s3_bucket.recordings.arn}",
          "${aws_s3_bucket.recordings.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_policy" "download_policy" {
  name = "DownloadFromS3"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = ["s3:GetObject"],
        Effect = "Allow",
        Resource = [
          "${aws_s3_bucket.recordings.arn}/*"
        ]
      }
    ]
  })
}


resource "aws_iam_role_policy_attachment" "attach_upload_policy" {
  role       = aws_iam_role.rtmp_role.name
  policy_arn = aws_iam_policy.upload_policy.arn
}

