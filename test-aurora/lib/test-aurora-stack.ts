import * as cdk from '@aws-cdk/core';
import * as rds from '@aws-cdk/aws-rds';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as c9 from '@aws-cdk/aws-cloud9';
import path = require('path');

export class TestAuroraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Need VPC
    // Need VPC Security Group with 3306 port access allowed
    // Need Serverless RDS MySql Cluster
    // Lambdas must be in same VPC as Aurora Database
    // Lamdbas need policies to access RDS Database
    // VPC security group needs to allow Lambda to access Aurora
    // Need a Cloud9 provisioned env to use as my database client
    // Need to add cloud9 security group to VPC security group with 3306 port access
    // Need Lambda custom resource to manage database schema, updates, etc - my_test_script.sql
    // Lambda can only be deployed into a private subnet
    // https://aws.amazon.com/getting-started/hands-on/configure-connect-serverless-mysql-database-aurora/

    const vpc = new ec2.Vpc(this, 'TestAuroraVPC');

    const cluster = new rds.ServerlessCluster(this, "MyTestAuroraDatabase", {
      engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_5_7_12 }),
      vpc
    });

    const testLambda = new lambda.Function(this, "MyTestAuroraLambda", {
      code: lambda.Code.fromAsset(path.join(__dirname, './../../test-sql-backend')),
      handler: "app.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "AURORA_DB_ENDPOINT": cluster.clusterEndpoint.hostname,
        "USERNAME": "admin",
        "PASSWORD": "n9=S=hk=4_G6Xgl23,OddnBHFew2Gj",
        "DATABASE_NAME": "premiere_league_data"
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "MyTestAuroraLambda",
      vpc,
    });
    const lambdaSecGroup = testLambda.connections.securityGroups[0];

    const rdsStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
          "rds:*"
      ],
      resources: [
          cluster.clusterArn
      ]
    });
    testLambda.addToRolePolicy(rdsStatement);

    // This works, but need to add the security group from cloud9 env to the inbound rules on the RDS security group manually currently
    // Navigate to security groups and note the security group ID of the cloud9 environment
    // Navigate to security groups and find the RDS Aurora Security Group, add an inbound rule for MySql Traffic for the security Group that was noted
    // mysql --user=admin --password -h testaurorastack-mytestauroradatabase54bfc2ea-7je3b58nks32.cluster-cpnwx33sv8cu.us-east-1.rds.amazonaws.com
    const cloud9Env = new c9.Ec2Environment(this, "AuroraClient", {
      vpc,
      description: "Cloud9 environment to use as Aurora Client"
    });

    const rdsSecurityGroup = cluster.connections.securityGroups[0];
    rdsSecurityGroup.addIngressRule(lambdaSecGroup, ec2.Port.allTraffic());
  }
}
