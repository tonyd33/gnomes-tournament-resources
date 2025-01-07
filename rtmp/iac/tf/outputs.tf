output "master_public_ip" {
  value = aws_instance.swarm_master.public_ip
}

output "worker_public_ips" {
  value = aws_instance.swarm_workers[*].public_ip
}

