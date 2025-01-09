resource "aws_security_group" "public" {
  vpc_id = aws_vpc.main_vpc.id
  # ssh
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # rtmp(s)
  ingress {
    from_port   = 1935
    to_port     = 1936
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # http(s)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "swarm" {
  vpc_id = aws_vpc.main_vpc.id
  # docker swarm
  ingress {
    from_port   = 2377
    to_port     = 2377
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
  }

  ingress {
    from_port   = 7946
    to_port     = 7946
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
  }

  ingress {
    from_port   = 7946
    to_port     = 7946
    protocol    = "udp"
    cidr_blocks = [var.cidr_block]
  }

  ingress {
    from_port   = 4789
    to_port     = 4789
    protocol    = "udp"
    cidr_blocks = [var.cidr_block]
  }

  # registry
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
  }
}


resource "aws_security_group" "gluster" {
  vpc_id = aws_vpc.main_vpc.id
  ingress {
    from_port   = 24007
    to_port     = 24008
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
  }

  ingress {
    from_port   = 24007
    to_port     = 24008
    protocol    = "udp"
    cidr_blocks = [var.cidr_block]
  }

  ingress {
    from_port   = 49152
    to_port     = 49200
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
  }
}


resource "aws_security_group" "egress" {
  vpc_id = aws_vpc.main_vpc.id
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
