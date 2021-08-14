import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as python from '@aws-cdk/aws-lambda-python';
import path = require('path');

export interface ExtractDraftPicksLambdaProps {
  draftPicksTable: ddb.Table;
}
export class ExtractDraftPicksLambda extends python.PythonFunction {
  constructor(scope: cdk.Construct, id: string, props: ExtractDraftPicksLambdaProps) {
    if (process.env.FANTASY_USERNAME && process.env.FANTASY_PASSWORD) {
      super(scope, id, {
        entry: path.join(__dirname, '../../../backend-service-python'),
        handler: "store_draft_picks_controller",
        tracing: lambda.Tracing.ACTIVE,
        timeout: cdk.Duration.seconds(300),
        environment: {
          "FANTASY_USERNAME": process.env.FANTASY_USERNAME,
          "FANTASY_PASSWORD": process.env.FANTASY_PASSWORD,
          "DRAFT_PICKS_TABLE_NAME": props.draftPicksTable.tableName
        },
        functionName: "ExtractDraftPicksLambda",
        description: "Fetches and stores the leagues draft picks for the season",
        memorySize: 1024
      });
    } else {
      throw new Error("No creds for authenticated request lambda")
    }

    props.draftPicksTable.grantReadWriteData(this);
  }
}
