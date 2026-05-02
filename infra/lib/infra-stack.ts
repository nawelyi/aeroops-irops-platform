import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "node:path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const healthFn = new NodejsFunction(this, "HealthFunction", {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../../backend/src/aws/health.ts"),
      handler: "handler",
      projectRoot: path.join(__dirname, "../../backend"),
      depsLockFilePath: path.join(__dirname, "../../backend/package-lock.json"),
      memorySize: 128,
      timeout: cdk.Duration.seconds(5)
    });

    const api = new HttpApi(this, "IropsHttpApi", {
      corsPreflight: {
        allowHeaders: ["content-type"],
        allowMethods: [CorsHttpMethod.GET],
        allowOrigins: ["http://localhost:5173"]
      }
    });

    api.addRoutes({
      path: "/health",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("HealthIntegration", healthFn)
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.apiEndpoint
    });
  }
}