terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-west-1"
}

# Key Pair for SSH Access
resource "aws_key_pair" "swarm_key" {
  key_name   = "swarm-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

# Define the EBS volume
resource "aws_ebs_volume" "master_storage" {
  availability_zone = aws_instance.swarm_master.availability_zone
  size              = var.storage_size
  type              = "gp3"            # General Purpose SSD
  tags = {
    Name = "Master-Storage"
  }
}

# Attach the EBS volume to the master node
resource "aws_volume_attachment" "master_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.master_storage.id
  instance_id = aws_instance.swarm_master.id
}

# Master Node
# Yes, only one. I'm not so concerned about fault tolerance here. I just want
# the easy service discovery and network mesh with Docker Swarm.
resource "aws_instance" "swarm_master" {
  # ubuntu 24.04
  ami             = "ami-0657605d763ac72a8"
  instance_type   = var.master_instance_type
  key_name        = aws_key_pair.swarm_key.key_name
  vpc_security_group_ids = [
    aws_security_group.public.id,
    aws_security_group.swarm.id,
    aws_security_group.gluster.id,
    aws_security_group.egress.id,
  ]
  subnet_id      = aws_subnet.public_subnet.id
  tags = {
    Name = "Swarm-Master"
  }

  user_data = <<-EOF
    #!/bin/bash
    hostnamectl set-hostname master
    echo "127.0.0.1 master" >> /etc/hosts

    if [ ! -e /dev/xvdf1 ]; then
      mkfs.ext4 /dev/xvdf
    fi

    mkdir -p /mnt/rtmp
    echo "/dev/xvdf ${var.mount_point} ext4 defaults,nofail 0 2" >> /etc/fstab
    mount -a

    echo "Initialization complete" >> /var/log/cloud-init.log
  EOF
}

# Worker Nodes
resource "aws_instance" "swarm_workers" {
  count = var.worker_count
  # ubuntu 24.04
  ami             = "ami-0657605d763ac72a8"
  instance_type   = var.worker_instance_type
  key_name        = aws_key_pair.swarm_key.key_name
  vpc_security_group_ids = [
    aws_security_group.public.id,
    aws_security_group.swarm.id,
    aws_security_group.gluster.id,
    aws_security_group.egress.id,
  ]
  tags = {
    Name = "Swarm-Worker-${count.index + 1}"
  }
  subnet_id      = aws_subnet.public_subnet.id
  user_data = <<-EOF
    #!/bin/bash
    hostnamectl set-hostname worker-${count.index + 1}
    echo "127.0.0.1 worker-${count.index + 1}" >> /etc/hosts

    echo "Initialization complete" >> /var/log/cloud-init.log
  EOF

  depends_on = [aws_instance.swarm_master]
}

