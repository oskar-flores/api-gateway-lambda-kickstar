import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Duration } from "aws-cdk-lib";

export interface ApiProps extends cdk.StackProps {
  url: string | undefined;
}

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: ApiProps) {
    super(scope, id, props);

    // 👇 create our HTTP Api
    const httpApi = new HttpApi(this, "http-api-example", {
      description: "HTTP API example",
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: [CorsHttpMethod.GET],
      },
    });

    // 👇 create get-todos Lambda
    const getLocationXml = new NodejsFunction(this, "get-xml", {
      runtime: Runtime.NODEJS_18_X,
      handler: "index.main",
      entry: "../../hello-world/app.ts",
      timeout: Duration.minutes(2),
      bundling: {
        minify: false,
      },
      environment: {
        URL: props?.url || "",
      },
    });

    // 👇 add route for GET /todos
    httpApi.addRoutes({
      path: "/location",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "get-location-integration",
        getLocationXml
      ),
    });

    // 👇 add an Output with the API Url
    new cdk.CfnOutput(this, "apiUrl", {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: httpApi.url!,
    });
  }
}
