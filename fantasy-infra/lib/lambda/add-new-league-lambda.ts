import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface AddNewLeagueLambdaProps {
    leagueDetailsTable: ddb.Table
}
export class AddNewLeagueLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: AddNewLeagueLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/last-of-the-mohigans-controller.addNewLeague",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "AddNewLeagueLambda",
      description: "Adds a new league"
    });

    props.leagueDetailsTable.grantReadWriteData(this);
  }
}
