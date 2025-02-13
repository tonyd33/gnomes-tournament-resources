variable "domain" {
  type = string
}

variable "master_instance_type" {
  description = "Instance type on the master"
  default     = "t3.medium"
}

variable "worker_count" {
  description = "Number of Docker Swarm worker nodes"
  default     = 3
}

variable "worker_instance_type" {
  description = "Instance type on each worker"
  default     = "t3.medium"
}

variable "storage_size" {
  description = "Storage size in gigabytes"
}

variable "mount_point" {
  # Keep this in sync with gluster_path in ansible vars
  default = "/mnt/recordings"
}

variable "cidr_block" {
  default = "10.0.0.0/16"
}

variable "porkbun_api_key" {
  type = string
  sensitive = true
}

variable "porkbun_secret_key" {
  type = string
  sensitive = true
}

