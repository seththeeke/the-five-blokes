import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface GetBlogPostLambdaProps {
    blogTable: ddb.Table
}
export class GetBlogPostLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: GetBlogPostLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/last-of-the-mohigans-controller.getBlogPosts",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "BLOG_POST_TABLE_NAME": props.blogTable.tableName
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "GetBlogPostLambda",
      description: "Fetches blog posts"
    });

    props.blogTable.grantReadData(this);
  }
}
