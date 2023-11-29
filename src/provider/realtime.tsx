import { createId } from "@paralleldrive/cuid2";
import { useEffect, useRef } from "react";

// https://github.com/brix/crypto-js/issues/415

export function RealtimeProvider() {
  const con =
    useRef<import("aws-iot-device-sdk-v2").mqtt.MqttClientConnection>();

  // useEffect(() => {
  //   if (connection.current) return;
  //   const url = process.env.NEXT_PUBLIC_IOT_HOST;
  //   async function createConnection() {
  //     const {  mqtt, iot } = await import("aws-iot-device-sdk-v2");
  //     console.log("creating new connection");
  //     if (connection.current) await connection.current.disconnect();
  //     const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
  //       .with_clean_session(true)
  //       .with_client_id("client_" + createId())
  //       .with_endpoint(url ?? "")
  //       .with_custom_authorizer(
  //         "",
  //         `${process.env.NEXT_PUBLIC_STAGE}-aws-crt-issue-authorizer`,
  //         "",
  //         ""
  //       )
  //       .with_keep_alive_seconds(1200)
  //       .build();
  //     const client = new mqtt.MqttClient();
  //     connection.current = client.new_connection(config);

  //     connection.current.on("connect", async () => {
  //       console.log("WS connected");

  //       if (connection.current) {
  //         await connection.current?.subscribe(
  //           `aws-crt-issue/${process.env.NEXT_PUBLIC_STAGE}/abc123/all/#`,
  //           mqtt.QoS.AtLeastOnce
  //         );
  //       }
  //     });

  //     connection.current.on("interrupt", (e) => {
  //       console.log("interrupted, restarting", e, JSON.stringify(e));
  //       createConnection();
  //     });
  //     connection.current.on("error", (e) => {
  //       console.log(
  //         "connection error",
  //         e,
  //         e.error,
  //         e.name,
  //         e.cause,
  //         e.message,
  //         e.error_code,
  //         e.error_name
  //       );
  //     });
  //     connection.current.on("resume", console.log);
  //     connection.current.on("message", (fullTopic, payload) => {
  //       const splits = fullTopic.split("/");
  //       const topic = splits[4];
  //       const message = new TextDecoder("utf8").decode(new Uint8Array(payload));
  //       const parsed = JSON.parse(message);
  //       if (topic === "poke") {
  //         console.log("got poke", parsed);
  //       } else {
  //         console.log("got message", parsed);
  //       }
  //     });
  //     connection.current.on("disconnect", console.log);

  //     await connection.current.connect();
  //   }

  //   createConnection();
  // }, []);

  useEffect(() => {
    const initializeRealtime = async () => {
      const { mqtt } = await import("aws-iot-device-sdk-v2");

      const topic = `aws-crt-issue/${process.env.NEXT_PUBLIC_STAGE}/abc123/all/#`;

      connect_websocket()
        .then((connection) => {
          con.current = connection;
          if (!connection) return;
          console.log(`start subscribe`);
          connection.subscribe(
            topic,
            mqtt.QoS.AtLeastOnce,
            (topic, payload) => {
              const decoder = new TextDecoder("utf8");
              let message = decoder.decode(new Uint8Array(payload));
              console.log(
                `Message received: topic=${topic} message=${message}`
              );
            }
          );
        })
        .catch((reason) => {
          console.log(`Error while connecting: ${reason}`);
        });
    };

    initializeRealtime();

    return () => {
      if (con.current) {
        con.current.disconnect();
      }
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

    connection.on("connect", () => {
      console.log("connection started:");
    });
    connection.on("interrupt", (error) => {
      console.log(`Connection interrupted: error=${error}`);
    });
    connection.on("resume", (return_code, session_present) => {
      console.log(
        `Resumed: rc: ${return_code} existing session: ${session_present}`
      );
    });
    connection.on("disconnect", () => {
      console.log("Disconnected");
    });
    connection.on("error", (error) => {
      console.error(error);
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
