import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as c9 from '@aws-cdk/aws-cloud9';
import { TestEmailsLambda } from './lambda/test/test-emails-lambda';
import { DataSources, DataSourceMapKeys } from './data/data-stores';

export interface DevelopmentResourcesStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
    dataSources: DataSources;
}
export class DevelopmentResourcesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: DevelopmentResourcesStackProps) {
    super(scope, id, props);

    // Will create a default cloud9 environment and a default security group
    // When setup for the first time, need to add the security group from cloud9 env to the inbound rules on the RDS security group manually currently
    // Navigate to security groups and note the security group ID of the cloud9 environment
    // Navigate to security groups and find the RDS Aurora Security Group, add an inbound rule for MySql Traffic for the security Group that was noted
    // Run the below in order to connect to the database
    // mysql --user=admin --password -h fantasyinfrastack-fantasyinfradatasourcespremierl-1k80385vyq4xu.cluster-cpnwx33sv8cu.us-east-1.rds.amazonaws.com
    new c9.Ec2Environment(this, "FantasyInfraCloud9Environment", {
        vpc: props.vpc,
        description: "Cloud9 environment to use as Aurora Client"
    });

    new TestEmailsLambda(this, "TestEmailsLambda", {
      functionName: "TestEmailsLambdaV2",
      description: "Controller for sending test emails outside of the state machine",
      handler: "controller/email-controller.sendTestEmails",
      mediaAssetsBucket: props.dataSources.dataSourcesMap.s3Buckets[DataSourceMapKeys.MEDIA_ASSET_BUCKET]
    });
  }
}
