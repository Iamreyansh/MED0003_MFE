#!/usr/bin/env node
import fs from 'node:fs';

const planPath = process.argv[2];
const environment = process.argv[3] ?? 'unknown';
const allowDestructive = process.env.ALLOW_DESTRUCTIVE === 'true';

if (!planPath) {
  console.error('Usage: tf-policy.mjs <plan.json> <environment>');
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const errors = [];
const warnings = [];

const resourceChanges = plan.resource_changes ?? [];

function afterValue(change, key) {
  return change.change?.after?.[key];
}

function actions(change) {
  return change.change?.actions ?? [];
}

for (const change of resourceChanges) {
  const type = change.type;
  const address = change.address;
  const acts = actions(change);
  const destroying = acts.includes('delete');
  const replacing = acts.includes('delete') && acts.includes('create');

  if (
    environment === 'production' &&
    (destroying || replacing) &&
    [
      'aws_s3_bucket',
      'aws_cloudfront_distribution',
      'aws_acm_certificate',
      'aws_route53_record',
      'aws_s3_bucket_policy',
    ].includes(type)
  ) {
    if (!allowDestructive) {
      errors.push(
        `Destructive production change blocked for ${address} (${acts.join(',')}). Set workflow input allow_destructive=true after approval.`,
      );
    }
  }

  if (type === 'aws_s3_bucket_acl') {
    errors.push(`Public/canned ACLs are not allowed: ${address}`);
  }

  if (type === 'aws_s3_bucket' && afterValue(change, 'acl')) {
    errors.push(
      `S3 bucket ACL must remain unset (BucketOwnerEnforced): ${address}`,
    );
  }

  if (type === 'aws_iam_role_policy' || type === 'aws_iam_policy') {
    const policy = afterValue(change, 'policy');
    if (typeof policy === 'string') {
      try {
        const doc = JSON.parse(policy);
        for (const statement of doc.Statement ?? []) {
          const statementActions = [statement.Action].flat();
          const resources = [statement.Resource].flat();
          const isDeployRole = address.includes('github_deploy');
          if (
            isDeployRole &&
            resources.includes('*') &&
            statementActions.some(
              (action) =>
                action === '*' || action === 's3:*' || action === 'iam:*',
            )
          ) {
            errors.push(`Deploy role has overly broad permissions: ${address}`);
          }
        }
      } catch {
        warnings.push(`Unable to parse IAM policy JSON for ${address}`);
      }
    }
  }
}

const summary = plan.output_changes
  ? Object.keys(plan.output_changes).length
  : 0;
const counts = resourceChanges.reduce(
  (acc, change) => {
    const acts = actions(change);
    if (acts.includes('create') && !acts.includes('delete')) acc.add += 1;
    if (acts.includes('update')) acc.change += 1;
    if (acts.includes('delete') && acts.includes('create')) acc.replace += 1;
    if (acts.includes('delete') && !acts.includes('create')) acc.destroy += 1;
    return acc;
  },
  { add: 0, change: 0, replace: 0, destroy: 0 },
);

const report = {
  environment,
  counts,
  outputChanges: summary,
  errors,
  warnings,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (errors.length > 0) {
  for (const error of errors) console.error(`::error::${error}`);
  process.exit(1);
}
