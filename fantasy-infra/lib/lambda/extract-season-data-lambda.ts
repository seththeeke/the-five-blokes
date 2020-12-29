import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ec2 from '@aws-cdk/aws-ec2';
import path = require('path');

export interface ExtractSeasonDataLambdaProps {
    vpc: ec2.Vpc;
}
export class ExtractSeasonDataLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: ExtractSeasonDataLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/season-processing-controller.extractSeasonDataHandler",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      timeout: cdk.Duration.seconds(300),
      functionName: "ExtractSeasonDataLambda",
      description: "Extracts data for a Season",
      vpc: props.vpc
    });
  }
}
