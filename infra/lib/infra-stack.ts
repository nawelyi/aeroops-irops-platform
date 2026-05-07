import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  AttributeType,
  BillingMode,
  Table,
} from "aws-cdk-lib/aws-dynamodb";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const incidentsTable = new Table(this, "IncidentsTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const healthFn = new NodejsFunction(this, "HealthFunction", {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../../backend/src/aws/health.ts"),
      handler: "handler",
      projectRoot: path.join(__dirname, "../../backend"),
      depsLockFilePath: path.join(__dirname, "../../backend/package-lock.json"),
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
    });

    const createIncidentFn = new NodejsFunction(this, "CreateIncidentFunction", {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../../backend/src/aws/create-incident.ts"),
      handler: "handler",
      projectRoot: path.join(__dirname, "../../backend"),
      depsLockFilePath: path.join(__dirname, "../../backend/package-lock.json"),
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      environment: {
        TABLE_NAME: incidentsTable.tableName,
      },
    });

    const listIncidentsFn = new NodejsFunction(this, "ListIncidentsFunction", {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../../backend/src/aws/list-incidents.ts"),
      handler: "handler",
      projectRoot: path.join(__dirname, "../../backend"),
      depsLockFilePath: path.join(__dirname, "../../backend/package-lock.json"),
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      environment: {
        TABLE_NAME: incidentsTable.tableName,
      },
    });

    incidentsTable.grantReadWriteData(createIncidentFn);
    incidentsTable.grantReadData(listIncidentsFn);

    const api = new HttpApi(this, "IropsHttpApi", {
      corsPreflight: {
        allowHeaders: ["content-type"],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowOrigins: ["http://localhost:5173"],
      },
    });

    api.addRoutes({
      path: "/health",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("HealthIntegration", healthFn),
    });

    api.addRoutes({
      path: "/incidents",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        "CreateIncidentIntegration",
        createIncidentFn
      ),
    });

    api.addRoutes({
      path: "/incidents",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "ListIncidentsIntegration",
        listIncidentsFn
      ),
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.apiEndpoint,
    });

    new cdk.CfnOutput(this, "IncidentsTableName", {
      value: incidentsTable.tableName,
    });
  }
}