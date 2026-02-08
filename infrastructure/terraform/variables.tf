# ═══════════════════════════════════════════════════════════════════════════════
# Apex Health Platform - Terraform Variables
# ═══════════════════════════════════════════════════════════════════════════════
# Override defaults by creating a terraform.tfvars file or passing -var flags.
#
# Example terraform.tfvars:
#   environment   = "production"
#   aws_region    = "us-east-1"
#   db_password   = "super-secret-password"
# ═══════════════════════════════════════════════════════════════════════════════

# ─── General ──────────────────────────────────────────────────────────────────

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "apex-health"
}

variable "environment" {
  description = "Deployment environment (development, staging, production)"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

# ─── VPC ──────────────────────────────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ─── EKS ──────────────────────────────────────────────────────────────────────

variable "eks_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.29"
}

variable "eks_node_instance_types" {
  description = "EC2 instance types for EKS worker nodes"
  type        = list(string)
  default     = ["t3.large"]
}

variable "eks_node_desired_count" {
  description = "Desired number of EKS worker nodes"
  type        = number
  default     = 3
}

variable "eks_node_min_count" {
  description = "Minimum number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "eks_node_max_count" {
  description = "Maximum number of EKS worker nodes (for autoscaling)"
  type        = number
  default     = 6
}

# ─── RDS PostgreSQL ───────────────────────────────────────────────────────────

variable "rds_instance_class" {
  description = "RDS instance class (size). Use db.t3.medium for dev, db.r6g.xlarge+ for production."
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 50
}

variable "rds_max_allocated_storage" {
  description = "Maximum auto-scaled storage in GB"
  type        = number
  default     = 200
}

variable "db_username" {
  description = "Master username for the RDS instance"
  type        = string
  default     = "apex_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Master password for the RDS instance. Must be changed in production."
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_password) >= 16
    error_message = "Database password must be at least 16 characters for HIPAA compliance."
  }
}

# ─── ElastiCache Redis ────────────────────────────────────────────────────────

variable "redis_node_type" {
  description = "ElastiCache node type. Use cache.t3.small for dev, cache.r6g.large+ for production."
  type        = string
  default     = "cache.t3.small"
}

variable "redis_auth_token" {
  description = "Auth token (password) for Redis. Must be 16-128 characters."
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.redis_auth_token) >= 16
    error_message = "Redis auth token must be at least 16 characters."
  }
}
