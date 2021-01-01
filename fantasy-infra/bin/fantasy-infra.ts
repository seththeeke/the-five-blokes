#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FantasyInfraStack } from '../lib/fantasy-infra-stack';
import { DevelopmentResourcesStack } from '../lib/development-resources-stack';

const app = new cdk.App();
const fantasyInfraStack = new FantasyInfraStack(app, 'FantasyInfraStack');
new DevelopmentResourcesStack(app, "DevelopmentResourcesStack", {
    vpc: fantasyInfraStack.vpc
});