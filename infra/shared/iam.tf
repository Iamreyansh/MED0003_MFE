locals {
  github_subs = {
    plan = [
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:pull_request",
      "repo:${var.github_org}/${var.github_repo}:pull_request",
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:ref:refs/heads/main",
      "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main",
    ]
    apply_staging = [
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:environment:staging",
      "repo:${var.github_org}/${var.github_repo}:environment:staging",
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:environment:terraform",
      "repo:${var.github_org}/${var.github_repo}:environment:terraform",
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:ref:refs/heads/main",
      "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main",
    ]
    apply_production = [
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:environment:production",
      "repo:${var.github_org}/${var.github_repo}:environment:production",
    ]
    artifacts = [
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:ref:refs/heads/main",
      "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main",
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:environment:staging",
      "repo:${var.github_org}/${var.github_repo}:environment:staging",
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:environment:production",
      "repo:${var.github_org}/${var.github_repo}:environment:production",
    ]
    ci_logs = [
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:pull_request",
      "repo:${var.github_org}/${var.github_repo}:pull_request",
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:ref:refs/heads/main",
      "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main",
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:environment:staging",
      "repo:${var.github_org}/${var.github_repo}:environment:staging",
      "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:environment:production",
      "repo:${var.github_org}/${var.github_repo}:environment:production",
    ]
  }
}

data "aws_iam_policy_document" "github_assume" {
  for_each = local.github_subs

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
      values   = each.value
    }
  }
}

resource "aws_iam_role" "github_plan" {
  name               = "${var.project_name}-github-tf-plan"
  assume_role_policy = data.aws_iam_policy_document.github_assume["plan"].json

  tags = { Purpose = "terraform-plan" }
}

resource "aws_iam_role" "github_apply_staging" {
  name               = "${var.project_name}-github-tf-apply-staging"
  assume_role_policy = data.aws_iam_policy_document.github_assume["apply_staging"].json

  tags = { Purpose = "terraform-apply-staging" }
}

resource "aws_iam_role" "github_apply_production" {
  name               = "${var.project_name}-github-tf-apply-production"
  assume_role_policy = data.aws_iam_policy_document.github_assume["apply_production"].json

  tags = { Purpose = "terraform-apply-production" }
}

resource "aws_iam_role" "github_artifacts" {
  name               = "${var.project_name}-github-artifacts"
  assume_role_policy = data.aws_iam_policy_document.github_assume["artifacts"].json

  tags = { Purpose = "ci-artifacts" }
}

resource "aws_iam_role" "github_ci_logs" {
  name               = "${var.project_name}-github-ci-logs"
  assume_role_policy = data.aws_iam_policy_document.github_assume["ci_logs"].json

  tags = { Purpose = "ci-logs" }
}

data "aws_iam_policy_document" "state_access" {
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
    resources = ["arn:aws:s3:::${var.tf_state_bucket}/MED0003/*"]
  }
}

data "aws_iam_policy_document" "plan_read" {
  source_policy_documents = [data.aws_iam_policy_document.state_access.json]

  statement {
    sid    = "ReadForPlan"
    effect = "Allow"
    actions = [
      "s3:Get*",
      "s3:List*",
      "s3:Describe*",
      "cloudfront:Get*",
      "cloudfront:List*",
      "cloudfront:Describe*",
      "acm:List*",
      "acm:Describe*",
      "acm:Get*",
      "route53:Get*",
      "route53:List*",
      "iam:Get*",
      "iam:List*",
      "ssm:Get*",
      "ssm:List*",
      "sns:Get*",
      "sns:List*",
      "cloudwatch:Describe*",
      "cloudwatch:Get*",
      "cloudwatch:List*",
      "budgets:ViewBudget",
      "budgets:Describe*",
      "sts:GetCallerIdentity",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "ListArtifactBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.artifacts.arn]
  }

  statement {
    sid       = "WriteTfPlans"
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.artifacts.arn}/tfplans/*"]
  }
}

data "aws_iam_policy_document" "apply" {
  source_policy_documents = [data.aws_iam_policy_document.state_access.json]

  statement {
    sid    = "ManageStack"
    effect = "Allow"
    actions = [
      "s3:*",
      "cloudfront:*",
      "acm:*",
      "route53:*",
      "ssm:*",
      "sns:*",
      "cloudwatch:*",
      "budgets:*",
      "sts:GetCallerIdentity",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ManageStackRoles"
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
    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project_name}-*",
      data.aws_iam_openid_connect_provider.github.arn,
    ]
  }
}

data "aws_iam_policy_document" "ci_logs" {
  statement {
    sid       = "ListCiLogsPrefix"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.artifacts.arn]

    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values   = ["ci-logs/*"]
    }
  }

  statement {
    sid       = "WriteCiLogsOnly"
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:AbortMultipartUpload"]
    resources = ["${aws_s3_bucket.artifacts.arn}/ci-logs/*"]
  }
}

data "aws_iam_policy_document" "artifacts" {
  statement {
    sid       = "ListArtifactBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.artifacts.arn]
  }

  statement {
    sid     = "WriteArtifacts"
    effect  = "Allow"
    actions = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = [
      "${aws_s3_bucket.artifacts.arn}/releases/*",
      "${aws_s3_bucket.artifacts.arn}/tfplans/*",
      "${aws_s3_bucket.artifacts.arn}/ci-logs/*",
    ]
  }
}

resource "aws_iam_role_policy" "github_plan" {
  name   = "${var.project_name}-github-tf-plan"
  role   = aws_iam_role.github_plan.id
  policy = data.aws_iam_policy_document.plan_read.json
}

resource "aws_iam_role_policy" "github_apply_staging" {
  name   = "${var.project_name}-github-tf-apply-staging"
  role   = aws_iam_role.github_apply_staging.id
  policy = data.aws_iam_policy_document.apply.json
}

resource "aws_iam_role_policy" "github_apply_production" {
  name   = "${var.project_name}-github-tf-apply-production"
  role   = aws_iam_role.github_apply_production.id
  policy = data.aws_iam_policy_document.apply.json
}

resource "aws_iam_role_policy" "github_artifacts" {
  name   = "${var.project_name}-github-artifacts"
  role   = aws_iam_role.github_artifacts.id
  policy = data.aws_iam_policy_document.artifacts.json
}

resource "aws_iam_role_policy" "github_ci_logs" {
  name   = "${var.project_name}-github-ci-logs"
  role   = aws_iam_role.github_ci_logs.id
  policy = data.aws_iam_policy_document.ci_logs.json
}
