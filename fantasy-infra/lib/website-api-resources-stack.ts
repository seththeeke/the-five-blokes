import * as cdk from '@aws-cdk/core';
import { LastOfTheMohigansRestService } from './rest-service/last-of-the-mohigans-rest-service';
import { DataSources } from './data/data-stores';

export interface WebsiteApiResourcesStackProps extends cdk.StackProps {
    dataSources: DataSources;
}
export class WebsiteApiResourcesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: WebsiteApiResourcesStackProps) {
    super(scope, id, props);

    const shouldUseDomainName = this.node.tryGetContext('shouldUseDomainName');
    new LastOfTheMohigansRestService(this, "LastOfTheMohigansRestService", {
      shouldUseDomainName,
      dataSourcesMap: props.dataSources.dataSourcesMap
    });
  }
}