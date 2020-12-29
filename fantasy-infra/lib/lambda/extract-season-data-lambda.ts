import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as iam from '@aws-cdk/aws-iam';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface ExtractSeasonDataLambdaProps {
    vpc: ec2.Vpc;
    plRDSCluster: rds.ServerlessCluster;
    leagueDetailsTable: ddb.Table;
    gameweeksTable: ddb.Table;
}
export class ExtractSeasonDataLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: ExtractSeasonDataLambdaProps) {
    let password = props.plRDSCluster.secret?.secretValueFromJson("password").toString() || "";
    super(scope, id, {
        code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
        handler: "controller/season-processing-controller.extractSeasonDataHandler",
        runtime: lambda.Runtime.NODEJS_12_X,
        tracing: lambda.Tracing.ACTIVE,
        environment: {
            "AURORA_DB_ENDPOINT": props.plRDSCluster.clusterEndpoint.hostname,
            "USERNAME": "admin",
            "PASSWORD": password,
            "DATABASE_NAME": "premiere_league_data",
            "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
            "GAMEWEEK_TABLE_NAME": props.gameweeksTable.tableName,
        },
        timeout: cdk.Duration.seconds(300),
        functionName: "ExtractSeasonDataLambda",
        description: "Extracts data for a Season",
        vpc: props.vpc
    });

    const lambdaSecGroup = this.connections.securityGroups[0];

    const rdsStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
          "rds:*"
      ],
      resources: [
          props.plRDSCluster.clusterArn
      ]
    });
    this.addToRolePolicy(rdsStatement);
    const rdsSecurityGroup = props.plRDSCluster.connections.securityGroups[0];
    rdsSecurityGroup.addIngressRule(lambdaSecGroup, ec2.Port.allTraffic());

    props.leagueDetailsTable.grantReadData(this);
    props.gameweeksTable.grantReadData(this);
  }
}
