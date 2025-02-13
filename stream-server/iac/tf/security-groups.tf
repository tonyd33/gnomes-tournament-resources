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
  ingress {
    from_port   = 2935
    to_port     = 2936
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # rtsp
  ingress {
    from_port   = 8554
    to_port     = 8554
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8554
    to_port     = 8554
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 9554
    to_port     = 9554
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 9554
    to_port     = 9554
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # rtsps
  ingress {
    from_port   = 8322
    to_port     = 8322
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8322
    to_port     = 8322
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 9322
    to_port     = 9322
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 9322
    to_port     = 9322
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # webrtc/whip
  ingress {
    from_port   = 8889
    to_port     = 8889
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8889
    to_port     = 8889
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8189
    to_port     = 8189
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8189
    to_port     = 8189
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # hls
  ingress {
    from_port   = 9888
    to_port     = 9888
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # srt
  ingress {
    from_port   = 8890
    to_port     = 8890
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8890
    to_port     = 8890
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8001
    protocol    = "udp"
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


resource "aws_security_group" "nfs" {
  vpc_id = aws_vpc.main_vpc.id
  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
  }

  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "udp"
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
