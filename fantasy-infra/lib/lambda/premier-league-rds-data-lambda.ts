import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as iam from '@aws-cdk/aws-iam';
import path = require('path');

export interface PremiereLeagueRDSDataLambdaProps {
    vpc: ec2.Vpc;
    plRDSCluster: rds.ServerlessCluster;
    handler: string;
    functionName: string;
    description: string;
    environmentVars?: {
        [key: string]: string;
    }
}
export class PremiereLeagueRDSDataLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: PremiereLeagueRDSDataLambdaProps) {
    let password = props.plRDSCluster.secret?.secretValueFromJson("password").toString() || "";
    super(scope, id, {
        code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
        handler: props.handler,
        runtime: lambda.Runtime.NODEJS_12_X,
        tracing: lambda.Tracing.ACTIVE,
        environment: {
            "AURORA_DB_ENDPOINT": props.plRDSCluster.clusterEndpoint.hostname,
            "USERNAME": "admin",
            "PASSWORD": password,
            "DATABASE_NAME": "premiere_league_data"
        },
        timeout: cdk.Duration.seconds(300),
        functionName: props.functionName,
        description: props.description,
        vpc: props.vpc
    });

    for (let i in props.environmentVars) {
        let key = i;
        let value = props.environmentVars[key];
        this.addEnvironment(key, value);
    }

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
  }
}
