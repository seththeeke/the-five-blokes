import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as python from '@aws-cdk/aws-lambda-python';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import path = require('path');

export interface AuthenticatedRequestLambdaProps {
    // fplCreds: secretsmanager.ISecret
}
export class AuthenticatedRequestLambda extends python.PythonFunction {
  constructor(scope: cdk.Construct, id: string, props: AuthenticatedRequestLambdaProps) {
    super(scope, id, {
      entry: path.join(__dirname, '../../../authenticated-request-lambda'),
      tracing: lambda.Tracing.ACTIVE,
      timeout: cdk.Duration.seconds(300),
      environment: {
        // "USERNAME": props.fplCreds.secretValueFromJson("USERNAME").toString(),
        // "PASSWORD": props.fplCreds.secretValueFromJson("PASSWORD").toString()
      },
      functionName: "AuthenticatedRequestLambda",
      description: "Requests data that requires authentication"
    });
  }
}
