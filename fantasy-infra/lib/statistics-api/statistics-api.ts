import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as sns from '@aws-cdk/aws-sns';
import * as snsSubs from '@aws-cdk/aws-sns-subscriptions';
import { GenerateStatisticsLambda } from './generate-statistics-lambda';
import { TriggerGenerateStatisticsLambda } from './trigger-generate-statistics-lambda';

export class StatisticsApi extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);
    const statisticsApiGateway = new apigateway.RestApi(this, "StatisticsApiGateway", {
      restApiName: "StatisticsApiGateway",
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["*"],
        allowHeaders: ["*"],
        allowCredentials: true
      }
    });
    
    const generateStatisticsTopic = new sns.Topic(this, "GenerateStatisticsTopic", {
        topicName: "GenerateStatisticsTopic"
    });

    const triggerGenerateStatisticsLambda = new TriggerGenerateStatisticsLambda(this, "TriggerGenerateStatisticsLambda", {
        generateStatisticsTopic
    });

    statisticsApiGateway.root.addMethod('ANY');
    const statisticsResource = statisticsApiGateway.root.addResource('statistics');
    const triggerGenerateStatisticsLambdaIntegration = new apigateway.LambdaIntegration(triggerGenerateStatisticsLambda);
    statisticsResource.addMethod('GET', triggerGenerateStatisticsLambdaIntegration);

    const generateStatisticsLambda = new GenerateStatisticsLambda(this, "GenerateStatisticsLambda");
    const snsSub = new snsSubs.LambdaSubscription(generateStatisticsLambda);
    generateStatisticsTopic.addSubscription(snsSub);
  }
}
