import { neonConfig } from "@neondatabase/serverless";

// Gathered from https://github.com/vercel/storage/issues/123#issuecomment-2326100123
// Connect to postgres through a proxy when developing locally or deploying to Docker
// to mimic the serverless environment

// Connect to 54320 in development environment
if (process.env.DEPLOYMENT_TYPE === "development") {
    neonConfig.wsProxy = (host) => `${host}:54330/v1`;
    neonConfig.useSecureWebSocket = false;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;
}

// Connect directly to port 80 in the other docker container
if (process.env.DEPLOYMENT_TYPE === "docker") {
    neonConfig.wsProxy = "pg_proxy:80/v1";
    neonConfig.useSecureWebSocket = false;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;
}

export * from "@vercel/postgres";
