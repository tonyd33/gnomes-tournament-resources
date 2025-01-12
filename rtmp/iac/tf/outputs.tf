output "master_public_ip" {
  value = aws_instance.swarm_master.public_ip
}

output "worker_public_ips" {
  value = aws_instance.swarm_workers[*].public_ip
}

output "load_generator_public_ips" {
  value = aws_instance.load_generators[*].public_ip
}

# We'll need this later for downloading
output "aws_access_key" {
  value     = aws_iam_access_key.rtmp_access_key
  sensitive = true
}
