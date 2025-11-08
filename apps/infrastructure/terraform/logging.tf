# S3 Buckets for Access Logs

# ALB Access Logs Bucket
resource "aws_s3_bucket" "alb_access_logs" {
  bucket = "${var.environment}-political-sphere-alb-access-logs-${random_string.alb_logs_suffix.result}"

  tags = {
    Name        = "political-sphere-alb-access-logs"
    Environment = var.environment
    Project     = "political-sphere"
    Purpose     = "ALB Access Logs"
  }
}

resource "aws_s3_bucket_versioning" "alb_access_logs" {
  bucket = aws_s3_bucket.alb_access_logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "alb_access_logs" {
  bucket = aws_s3_bucket.alb_access_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_policy" "alb_access_logs" {
  bucket = aws_s3_bucket.alb_access_logs.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSLogDeliveryWrite"
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_access_logs.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      },
      {
        Sid    = "AWSLogDeliveryAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.alb_access_logs.arn
      }
    ]
  })
}

resource "random_string" "alb_logs_suffix" {
  length  = 8
  lower   = true
  upper   = false
  numeric = true
  special = false
}

# Jaeger Access Logs Bucket
resource "aws_s3_bucket" "jaeger_access_logs" {
  bucket = "${var.environment}-political-sphere-jaeger-access-logs-${random_string.jaeger_logs_suffix.result}"

  tags = {
    Name        = "political-sphere-jaeger-access-logs"
    Environment = var.environment
    Project     = "political-sphere"
    Purpose     = "Jaeger Access Logs"
  }
}

resource "aws_s3_bucket_versioning" "jaeger_access_logs" {
  bucket = aws_s3_bucket.jaeger_access_logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "jaeger_access_logs" {
  bucket = aws_s3_bucket.jaeger_access_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_policy" "jaeger_access_logs" {
  bucket = aws_s3_bucket.jaeger_access_logs.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSLogDeliveryWrite"
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.jaeger_access_logs.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      },
      {
        Sid    = "AWSLogDeliveryAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.jaeger_access_logs.arn
      }
    ]
  })
}

resource "random_string" "jaeger_logs_suffix" {
  length  = 8
  lower   = true
  upper   = false
  numeric = true
  special = false
}
