data "aws_iam_policy_document" "github_assume_deploy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:environment:production",
        "repo:${var.github_org}/${var.github_repo}:environment:production",
        "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:ref:refs/heads/main",
        "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main",
      ]
    }
  }
}

data "aws_iam_policy_document" "github_assume_terraform" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:environment:terraform",
        "repo:${var.github_org}/${var.github_repo}:environment:terraform",
        "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:ref:refs/heads/main",
        "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main",
        "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:pull_request",
        "repo:${var.github_org}/${var.github_repo}:pull_request",
      ]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "${var.project_name}-github-actions"
  assume_role_policy = data.aws_iam_policy_document.github_assume_deploy.json

  tags = {
    Project = var.project_name
    Purpose = "deploy"
  }
}

data "aws_iam_policy_document" "github_deploy" {
  statement {
    sid       = "ListBuckets"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [for m in module.mfe : m.bucket_arn]
  }

  statement {
    sid       = "WriteObjects"
    effect    = "Allow"
    actions   = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"]
    resources = [for m in module.mfe : "${m.bucket_arn}/*"]
  }

  statement {
    sid       = "InvalidateDistributions"
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [for m in module.mfe : m.distribution_arn]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "${var.project_name}-github-deploy"
  role   = aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.github_deploy.json
}

resource "aws_iam_role" "github_actions_terraform" {
  name               = "${var.project_name}-github-terraform"
  assume_role_policy = data.aws_iam_policy_document.github_assume_terraform.json

  tags = {
    Project = var.project_name
    Purpose = "terraform"
  }
}

data "aws_iam_policy_document" "github_terraform" {
  statement {
    sid    = "TerraformStateBucket"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketVersioning",
      "s3:GetBucketLocation",
    ]
    resources = ["arn:aws:s3:::${var.tf_state_bucket}"]
  }

  statement {
    sid    = "TerraformStateObjects"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["arn:aws:s3:::${var.tf_state_bucket}/*"]
  }

  statement {
    sid       = "SiteBucketAdmin"
    effect    = "Allow"
    actions   = ["s3:*"]
    resources = ["*"]
  }

  statement {
    sid    = "CloudFront"
    effect = "Allow"
    actions = [
      "cloudfront:*",
    ]
    resources = ["arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:*"]
  }

  statement {
    sid    = "ACM"
    effect = "Allow"
    actions = [
      "acm:*",
    ]
    resources = ["arn:aws:acm:*:${data.aws_caller_identity.current.account_id}:*"]
  }

  statement {
    sid    = "Route53"
    effect = "Allow"
    actions = [
      "route53:ChangeResourceRecordSets",
      "route53:GetHostedZone",
      "route53:ListResourceRecordSets",
      "route53:ListTagsForResource",
      "route53:ListHostedZones",
      "route53:ListHostedZonesByName",
      "route53:GetChange",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "IAMForStackRoles"
    effect = "Allow"
    actions = [
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:GetRole",
      "iam:UpdateRole",
      "iam:UpdateAssumeRolePolicy",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:PassRole",
      "iam:PutRolePolicy",
      "iam:GetRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:ListRolePolicies",
      "iam:ListAttachedRolePolicies",
      "iam:GetOpenIDConnectProvider",
      "iam:ListOpenIDConnectProviders",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "github_terraform" {
  name   = "${var.project_name}-github-terraform"
  role   = aws_iam_role.github_actions_terraform.id
  policy = data.aws_iam_policy_document.github_terraform.json
}
