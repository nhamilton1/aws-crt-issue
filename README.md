#### Issue

When using aws-iot-device-sdk-v2 package, which uses aws-crt, the package fails to load the aws-crt binary.

```
Error: AWS CRT binary not present in any of the following locations:
/var/task/node_modules/.pnpm/aws-crt@1.19.0/node_modules/aws-crt/dist/bin/linux-arm64-glibc/aws-crt-nodejs
    at Object.<anonymous> (/var/task/node_modules/.pnpm/aws-crt@1.19.0/node_modules/aws-crt/dist/native/binding.js:97:11)
    at Module._compile (node:internal/modules/cjs/loader:1256:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1310:10)
    at Module.load (node:internal/modules/cjs/loader:1119:32)
    at Module._load (node:internal/modules/cjs/loader:960:12)
    at Module.require (node:internal/modules/cjs/loader:1143:19)
    at require (node:internal/modules/cjs/helpers:119:18)
    at Object.<anonymous> (/var/task/node_modules/.pnpm/aws-crt@1.19.0/node_modules/aws-crt/dist/native/auth.js:20:35)
    at Module._compile (node:internal/modules/cjs/loader:1256:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1310:10)
```

Things I've tried:

```ts
const site = new NextjsSite(stack, "site", {
  permissions: ["iot"],
  //@ts-ignore
  nodejs: {
    esbuild: {
      external: ["aws-iot-device-sdk-v2", "aws-crt"],
    },
  },
});
```

```ts
const site = new NextjsSite(stack, "site", {
  permissions: ["iot"],
  cdk: {
    server: {
      copyFiles: [
        {
          from: "linux-arm64-glibc/aws-crt-nodejs.node",
          to: "var/task/node_modules/.pnpm/aws-crt@1.19.0/node_modules/aws-crt/dist/bin/",
        },
      ],
    },
  },
});
```

I might be doing this wrong, but I tried copying the binary from `linux-arm64-glibc/aws-crt-nodejs.node` to `var/task/node_modules/.pnpm/aws-crt@1.19.0/node_modules/aws-crt/dist/bin/` and a bunch of other places, but it still fails to load the binary.
