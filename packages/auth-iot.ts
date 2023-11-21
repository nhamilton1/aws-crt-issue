import { Config } from "sst/node/config";

export async function handler(evt: any) {

  const policy = {
    isAuthenticated: true, //A Boolean that determines whether client can connect.
    principalId: Date.now().toString(), //A string that identifies the connection in logs.
    disconnectAfterInSeconds: 86400,
    refreshAfterInSeconds: 300,
    policyDocuments: [
      {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "iot:Connect",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
      {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "iot:Receive",
            Effect: "Allow",
            Resource: `arn:aws:iot:us-east-1:${process.env.ACCOUNT}:topic/${Config.APP}/${Config.STAGE}/abc123/*`,
          },
          {
            Action: "iot:Subscribe",
            Effect: "Allow",
            Resource: `arn:aws:iot:us-east-1:${process.env.ACCOUNT}:topicfilter/${Config.APP}/${Config.STAGE}/abc123/*`,
          },
        ],
      },
    ],
  };

  return policy;
}
