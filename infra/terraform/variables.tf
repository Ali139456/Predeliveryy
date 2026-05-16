variable "aws_region" {
  description = "AWS region (client requirement: Sydney)"
  type        = string
  default     = "ap-southeast-2"
}

variable "environment" {
  description = "Environment name: dev | staging | prod"
  type        = string
  default     = "dev"
}

variable "project_name" {
  type    = string
  default = "predelivery"
}

variable "s3_bucket_name" {
  description = "Globally unique S3 bucket for inspection uploads"
  type        = string
}
