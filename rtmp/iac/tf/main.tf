terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.32.0"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "ca-west-1"
}


# Key Pair for SSH Access
resource "aws_key_pair" "swarm_key" {
  key_name   = "swarm-key"
  public_key = file("~/.ssh/id_rsa.pub")
}


resource "aws_ebs_volume" "master_storage" {
  availability_zone = aws_instance.swarm_master.availability_zone
  size              = var.storage_size
  type              = "gp3"
  tags = {
    Name = "Master-Storage"
  }
}

resource "aws_volume_attachment" "master_attach" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.master_storage.id
  instance_id = aws_instance.swarm_master.id
}

resource "aws_iam_instance_profile" "rtmp_instance_profile" {
  name = "rtmp-instance-profile"
  role = aws_iam_role.rtmp_role.name
}

# Master Node
resource "aws_instance" "swarm_master" {
  # ubuntu 24.04
  ami           = "ami-0049815cd593da697"
  instance_type = var.master_instance_type
  key_name      = aws_key_pair.swarm_key.key_name
  vpc_security_group_ids = [
    aws_security_group.public.id,
    aws_security_group.swarm.id,
    aws_security_group.gluster.id,
    aws_security_group.egress.id,
  ]
  iam_instance_profile = aws_iam_instance_profile.rtmp_instance_profile.name
  subnet_id            = aws_subnet.public_subnet.id
  tags = {
    Name = "Swarm-Master"
  }

  root_block_device {
    volume_size = 32
  }

  user_data = <<-EOF
    #!/bin/bash
    hostnamectl set-hostname master
    echo "127.0.0.1 master" >> /etc/hosts

    if [ ! -e /dev/xvdf1 ]; then
      mkfs.ext4 /dev/xvdf
    fi

    mkdir -p ${var.mount_point}
    echo "/dev/xvdf ${var.mount_point} ext4 defaults,nofail 0 2" >> /etc/fstab
    mount -a

    echo "Initialization complete" >> /var/log/cloud-init.log
  EOF
}

resource "aws_ebs_volume" "workers_storage" {
  count             = var.worker_count
  availability_zone = aws_instance.swarm_master.availability_zone
  size              = var.storage_size
  type              = "gp3" # General Purpose SSD
  tags = {
    Name = "Worker-Storage"
  }
}

resource "aws_volume_attachment" "worker_attach" {
  count       = var.worker_count
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.workers_storage[count.index].id
  instance_id = aws_instance.swarm_workers[count.index].id
}

# Worker Nodes
resource "aws_instance" "swarm_workers" {
  count = var.worker_count
  # ubuntu 24.04
  ami           = "ami-0049815cd593da697"
  instance_type = var.worker_instance_type
  key_name      = aws_key_pair.swarm_key.key_name
  vpc_security_group_ids = [
    aws_security_group.public.id,
    aws_security_group.swarm.id,
    aws_security_group.gluster.id,
    aws_security_group.egress.id,
  ]
  iam_instance_profile = aws_iam_instance_profile.rtmp_instance_profile.name
  tags = {
    Name = "Swarm-Worker-${count.index + 1}"
  }

  subnet_id = aws_subnet.public_subnet.id

  root_block_device {
    volume_size = 32
  }
  user_data = <<-EOF
    #!/bin/bash
    hostnamectl set-hostname worker-${count.index + 1}
    echo "127.0.0.1 worker-${count.index + 1}" >> /etc/hosts

    if [ ! -e /dev/xvdf1 ]; then
      mkfs.ext4 /dev/xvdf
    fi

    mkdir -p ${var.mount_point}
    echo "/dev/xvdf ${var.mount_point} ext4 defaults,nofail 0 2" >> /etc/fstab
    mount -a

    echo "Initialization complete" >> /var/log/cloud-init.log
  EOF

  depends_on = [aws_instance.swarm_master]
}

resource "aws_instance" "load_generators" {
  count = var.load_generator_count
  # ubuntu 24.04
  ami           = "ami-0049815cd593da697"
  instance_type = "t3.micro"
  key_name      = aws_key_pair.swarm_key.key_name
  vpc_security_group_ids = [
    aws_security_group.public.id,
    aws_security_group.swarm.id,
    aws_security_group.gluster.id,
    aws_security_group.egress.id,
  ]
  tags = {
    Name = "Load-Generator-${count.index + 1}"
  }

  subnet_id = aws_subnet.public_subnet.id

  root_block_device {
    volume_size = 32
  }
  user_data = <<-EOF
    #!/bin/bash
    hostnamectl set-hostname load-tester-${count.index + 1}
    echo "127.0.0.1 load-generator-${count.index + 1}" >> /etc/hosts

    echo "Initialization complete" >> /var/log/cloud-init.log
  EOF
}

