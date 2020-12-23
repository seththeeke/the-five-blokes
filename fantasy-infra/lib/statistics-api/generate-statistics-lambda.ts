import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import path = require('path');

export class GenerateStatisticsLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id, {
        code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
        functionName: "GenerateStatisticsLambda",
        description: "Controller for generating statistics on demand to be emailed to subscribers",
        handler: "controller/statistics-controller.generateStatisticsController",
        runtime: lambda.Runtime.NODEJS_12_X,
        tracing: lambda.Tracing.ACTIVE,
        timeout: cdk.Duration.seconds(300),
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
