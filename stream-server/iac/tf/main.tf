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

resource "aws_ebs_volume" "worker_storage" {
  count             = var.worker_count
  availability_zone = aws_instance.swarm_master.availability_zone
  size              = var.storage_size
  type              = "gp3"
  tags = {
    Name = "Worker-Storage-${count.index}"
  }
}

resource "aws_volume_attachment" "worker_attach" {
  count       = var.worker_count
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.worker_storage[count.index].id
  instance_id = aws_instance.swarm_worker[count.index].id
}

resource "aws_iam_instance_profile" "rtmp_instance_profile" {
  name = "rtmp-instance-profile"
  role = aws_iam_role.recording_role.name
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
    aws_security_group.nfs.id,
    aws_security_group.egress.id,
  ]
  iam_instance_profile = aws_iam_instance_profile.rtmp_instance_profile.name
  subnet_id            = aws_subnet.public_subnet.id
  tags = {
    Name = "swarm-master-01"
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

# Worker Nodes
resource "aws_instance" "swarm_worker" {
  count = var.worker_count
  # ubuntu 24.04
  ami           = "ami-0049815cd593da697"
  instance_type = var.worker_instance_type
  key_name      = aws_key_pair.swarm_key.key_name
  vpc_security_group_ids = [
    aws_security_group.public.id,
    aws_security_group.swarm.id,
    aws_security_group.nfs.id,
    aws_security_group.egress.id,
  ]
  iam_instance_profile = aws_iam_instance_profile.rtmp_instance_profile.name
  tags = {
    Name = "swarm-worker-${format("%02s", count.index + 1)}"
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

locals {
  main_subdomains = [
    "prt",
    "ri",
    "trfk",
    "prom",
    "api",
    "app",
    "gf",
  ]
}

resource "porkbun_dns_record" "swarm_master_a" {
  domain = var.domain
  type = "A"
  name = aws_instance.swarm_master.tags.Name
  content = aws_instance.swarm_master.public_ip
}

resource "porkbun_dns_record" "swarm_workers_a" {
  count = var.worker_count
  domain = var.domain
  type = "A"
  name = aws_instance.swarm_worker[count.index].tags.Name
  content = aws_instance.swarm_worker[count.index].public_ip
}

resource "porkbun_dns_record" "swarm_master_a_main" {
  domain = var.domain
  type = "A"
  name = ""
  content = aws_instance.swarm_master.public_ip
}

resource "porkbun_dns_record" "swarm_master_cname" {
  count = length(local.main_subdomains)

  domain = var.domain
  name = local.main_subdomains[count.index]
  type = "CNAME"
  content = var.domain
}

resource "ansible_host" "swarm_master" {
  name = "${porkbun_dns_record.swarm_master_a.name}.${porkbun_dns_record.swarm_master_a.domain}"
  groups = ["swarm_master", "nfs_server"]
  variables = {
    ipv4_public_address = "${porkbun_dns_record.swarm_master_a.content}"
  }
}

resource "ansible_host" "swarm_worker" {
  count = var.worker_count
  name = "${porkbun_dns_record.swarm_workers_a[count.index].name}.${porkbun_dns_record.swarm_workers_a[count.index].domain}"
  variables = {
    ipv4_public_address = "${porkbun_dns_record.swarm_workers_a[count.index].content}"
  }
  groups = ["swarm_worker", "nfs_client"]
}

