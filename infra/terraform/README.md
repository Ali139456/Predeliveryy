# AWS Sydney baseline (Pre Delivery)

Terraform for **private S3** uploads in `ap-southeast-2`, aligned with client hosting requirements.

## Prerequisites

- AWS CLI configured for the Predelivery.ai account
- Terraform 1.5+

## Usage

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit s3_bucket_name (must be globally unique)
terraform init
terraform plan
terraform apply
```

Set app env after apply:

- `AWS_REGION=ap-southeast-2`
- `AWS_S3_BUCKET_NAME=<uploads_bucket_name output>`
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` from an IAM user or role scoped to this bucket

## Environments

Use separate `terraform.tfvars` (or workspaces) per **dev**, **staging**, and **prod** with different `environment` and `s3_bucket_name` values.
