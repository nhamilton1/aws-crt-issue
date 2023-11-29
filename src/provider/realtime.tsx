import { createId } from "@paralleldrive/cuid2";
import { useEffect, useRef } from "react";

// https://github.com/brix/crypto-js/issues/415

export function RealtimeProvider() {
  const ran = useRef(false);

  useEffect(() => {
    const initializeRealtime = async () => {
      try {
        await connect_websocket();
      } catch (reason) {
        console.error(`Error while connecting: ${reason}`);
      }
    };

    if (ran.current === false) {
      initializeRealtime();
    }

    return () => {
      ran.current = true;
    };
  }, []);

  return null;
}

async function connect_websocket() {
  try {
    const { iot, mqtt } = await import("aws-iot-device-sdk-v2");
    const url = process.env.NEXT_PUBLIC_IOT_HOST;

    let config =
      iot.AwsIotMqttConnectionConfigBuilder.new_builder_for_websocket()
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

    console.log("Connecting websocket...");
    const client = new mqtt.MqttClient();
    console.log("new connection ...");
    const connection = client.new_connection(config);
    console.log("setup callbacks ...");

    connection.on("connect", async () => {
      console.log("WS connected");

      if (connection) {
        await connection.subscribe(
          `aws-crt-issue/${process.env.NEXT_PUBLIC_STAGE}/abc123/all/#`,
          mqtt.QoS.AtLeastOnce
        );
      }
    });

    connection.on("interrupt", (error) => {
      console.log(`Connection interrupted: error=${error}`);
      connect_websocket();
    });

    connection.on("resume", (return_code, session_present) => {
      console.log(
        `Resumed: rc: ${return_code} existing session: ${session_present}`
      );
    });

    connection.on("disconnect", () => {
      console.log("Disconnected");
    });

    connection.on("error", (e) => {
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

    connection.on("message", (fullTopic, payload) => {
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

    console.log("connect...");
    await connection.connect();

    return connection;
  } catch (error) {
    console.error(error);
  }
}
