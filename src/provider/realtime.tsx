import { iot, mqtt } from "aws-iot-device-sdk-v2";
import { createId } from "@paralleldrive/cuid2";
import { useEffect, useRef } from "react";

export function RealtimeProvider() {
  const connection = useRef<mqtt.MqttClientConnection>();

  useEffect(() => {
    if (connection.current) return;
    const url = process.env.NEXT_PUBLIC_IOT_HOST;
    async function createConnection() {
      console.log("creating new connection");
      if (connection.current) await connection.current.disconnect();
      const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
        .with_clean_session(true)
        .with_client_id("client_" + createId())
        .with_endpoint(url ?? "")
        .with_custom_authorizer(
          "",
          `${process.env.NEXT_PUBLIC_STAGE}-aws-crt-issue-authorizer`,
          "",
          ""
        )
        .with_keep_alive_seconds(1200)
        .build();
      const client = new mqtt.MqttClient();
      connection.current = client.new_connection(config);

      connection.current.on("connect", async () => {
        console.log("WS connected");

        if (connection.current) {
          await connection.current?.subscribe(
            `aws-crt-issue/${process.env.NEXT_PUBLIC_STAGE}/abc123/all/#`,
            mqtt.QoS.AtLeastOnce
          );
        }
      });

      connection.current.on("interrupt", (e) => {
        console.log("interrupted, restarting", e, JSON.stringify(e));
        createConnection();
      });
      connection.current.on("error", (e) => {
        console.log(
          "connection error",
          e,
          e.error,
          e.name,
          e.cause,
          e.message,
          e.error_code,
          e.error_name
        );
      });
      connection.current.on("resume", console.log);
      connection.current.on("message", (fullTopic, payload) => {
        const splits = fullTopic.split("/");
        const topic = splits[4];
        const message = new TextDecoder("utf8").decode(new Uint8Array(payload));
        const parsed = JSON.parse(message);
        if (topic === "poke") {
          console.log("got poke", parsed);
        } else {
          console.log("got message", parsed);
        }
      });
      connection.current.on("disconnect", console.log);

      await connection.current.connect();
    }

    createConnection();
  }, []);

  return null;
}
