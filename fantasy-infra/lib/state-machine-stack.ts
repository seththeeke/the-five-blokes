import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { FantasyLeagueStateMachine } from './step-function/fantasy-league-state-machine';
import { DataSources, DataSourceMapKeys } from './data/data-stores';


export interface StateMachineStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
    dataSources: DataSources;
}
export class StateMachineStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: StateMachineStackProps) {
    super(scope, id, props);

    const fantasyLeagueStateMachine = new FantasyLeagueStateMachine(this, "GameweekProcessing", {
      gameweekCompletedTopic: props.dataSources.dataSourcesMap.topics[DataSourceMapKeys.GAMEWEEK_COMPLETED_TOPIC],
      seasonCompletedTopic: props.dataSources.dataSourcesMap.topics[DataSourceMapKeys.SEASON_COMPLETED_TOPIC],
      errorTopic: props.dataSources.dataSourcesMap.topics[DataSourceMapKeys.ERROR_TOPIC],
      dataSourcesMap: props.dataSources.dataSourcesMap,
      vpc: props.vpc
    });

  }
}
