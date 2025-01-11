output "master_public_ip" {
  value = aws_instance.swarm_master.public_ip
}

output "worker_public_ips" {
  value = aws_instance.swarm_workers[*].public_ip
}

output "aws_secret_access_key" {
  value     = aws_iam_access_key.rtmp_access_key
  sensitive = true
}

output "recordings_url" {
  value       = aws_s3_bucket.recordings.website_endpoint
  description = "The URL for the S3 static website hosting the recordings."
}
