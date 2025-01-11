resource "aws_s3_bucket" "recordings" {
  bucket = "rtmp-recordings-bucket"
  acl = "private"

  # don't let me idiot pls
  lifecycle {
    prevent_destroy = true
  }
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

resource "aws_iam_user" "rtmp_user" {
  name = "rtmp-user"
}

resource "aws_iam_access_key" "rtmp_access_key" {
  user = aws_iam_user.rtmp_user.name
}

resource "aws_iam_role_policy_attachment" "attach_upload_policy" {
  role       = aws_iam_role.rtmp_role.name
  policy_arn = aws_iam_policy.upload_policy.arn
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

resource "aws_iam_user_policy_attachment" "recordings_user_download_policy" {
  user       = aws_iam_user.rtmp_user.name
  policy_arn = aws_iam_policy.download_policy.arn
}

