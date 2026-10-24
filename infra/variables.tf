variable "region" {
  description = "AWS region where everything is created."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Name prefix used for every resource."
  type        = string
  default     = "eva2-skateshop"
}

variable "vpc_cidr" {
  description = "Address range of the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Address range of the public subnet (must be inside vpc_cidr)."
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 size. t3.micro is Free Tier eligible in most regions."
  type        = string
  default     = "t3.micro"
}

variable "ssh_allowed_cidr" {
  description = "Only this range may open SSH (port 22). Use your own public IP with /32, e.g. 181.43.10.25/32."
  type        = string

  validation {
    # IPv4 CIDR whose prefix is between /16 and /32.
    condition     = can(regex("^\\d{1,3}(\\.\\d{1,3}){3}/(1[6-9]|2\\d|3[0-2])$", var.ssh_allowed_cidr)) && can(cidrhost(var.ssh_allowed_cidr, 0))
    error_message = "ssh_allowed_cidr must be a valid CIDR with a prefix of /16 or narrower (ideally your IP with /32). Wide ranges such as 0.0.0.0/0 would open SSH to the internet."
  }
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key allowed to log into the instance. If it is not ~/.ssh/id_ed25519.pub, run deploy.sh with SSH_KEY=<matching private key>."
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}
