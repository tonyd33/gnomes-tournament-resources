output "master_public_ip" {
  value = aws_instance.swarm_master.public_ip
}

output "worker_public_ips" {
  value = aws_instance.swarm_worker[*].public_ip
}

# We'll need this later for downloading
output "aws_access_key" {
  value     = aws_iam_access_key.recording_access_key
  sensitive = true
}
