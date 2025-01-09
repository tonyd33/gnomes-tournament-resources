variable "master_instance_type" {
  description = "Instance type on the master"
  # This is the weakest instance that hits "Moderate" network performance.
  # The master node also acts as our ingress/egress node so we may need this
  # bandwidth.
  default     = "t2.xlarge"
}

variable "worker_count" {
  description = "Number of Docker Swarm worker nodes"
  default     = 2
}

variable "worker_instance_type" {
  description = "Instance type on each worker"
  default     = "t2.medium"
}

variable "storage_size" {
  description = "Storage size in gigabytes"
  default = 500
}

variable "mount_point" {
  default = "/mnt/rtmp"
}

variable "cidr_block" {
  default = "10.0.0.0/16"
}
