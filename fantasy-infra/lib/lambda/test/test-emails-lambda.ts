import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import path = require('path');

export interface TestEmailsLambdaProps {
    handler: string;
    functionName: string;
    description: string;
    mediaAssetsBucket: s3.Bucket;
}
export class TestEmailsLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: TestEmailsLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../../backend-service')),
      handler: props.handler,
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "MEDIA_ASSETS_BUCKET_URL": props.mediaAssetsBucket.bucketDomainName
      },
      timeout: cdk.Duration.seconds(300),
      functionName: props.functionName,
      description: props.description
    });

    const emailPolicyStatement = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
            "ses:SendEmail",
            "ses:SendRawEmail",
            "ses:SendTemplatedEmail",
            "ses:GetTemplate",
            "ses:ListTemplates"
        ],
        resources: [
            "*"
        ]
    });
    this.addToRolePolicy(emailPolicyStatement);
  }
}
