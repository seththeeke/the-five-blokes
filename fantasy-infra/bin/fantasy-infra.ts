#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FantasyInfraStack } from '../lib/fantasy-infra-stack';

const app = new cdk.App();
new FantasyInfraStack(app, 'FantasyInfraStack');
