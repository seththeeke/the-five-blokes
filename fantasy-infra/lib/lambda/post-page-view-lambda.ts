import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface PostPageViewLambdaProps {
    blogTable: ddb.Table
}
export class PostPageViewLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: PostPageViewLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/last-of-the-mohigans-controller.postPageView",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "BLOG_POST_TABLE_NAME": props.blogTable.tableName
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "PostPageViewLambda",
      description: "Posts a page view for a given page"
    });

    props.blogTable.grantReadWriteData(this);
  }
}
