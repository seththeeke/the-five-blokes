import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as python from '@aws-cdk/aws-lambda-python';
import path = require('path');

export interface GetLiveViewLambdaProps {
}
export class GetLiveViewLambda extends python.PythonFunction {
  constructor(scope: cdk.Construct, id: string) {
    if (process.env.FANTASY_USERNAME && process.env.FANTASY_PASSWORD) {
      super(scope, id, {
        entry: path.join(__dirname, '../../../backend-service-python'),
        handler: "get_live_view_controller",
        tracing: lambda.Tracing.ACTIVE,
        timeout: cdk.Duration.seconds(300),
        environment: {
          "FANTASY_USERNAME": process.env.FANTASY_USERNAME,
          "FANTASY_PASSWORD": process.env.FANTASY_PASSWORD
        },
        functionName: "GetLiveViewLambda",
        description: "Fetches the live view of the league",
        memorySize: 1024
      });
    } else {
      throw new Error("No creds for authenticated request lambda")
    }
  }
}
