---
title: "Arbitrum RPC Proxy and Caching"
description: "open-source fault-tolerant evm rpc proxy with reorg-aware permanent caching."
author: kasra-khosravi
sme: kasra-khosravi
third_party_content_owner: kasrakhosravi
sidebar_label: "eRPC"
---

##

[eRPC](https://github.com/erpc/erpc) is a fault-tolerant EVM RPC proxy and re-org aware permanent caching solution. It is built with read-heavy use-cases in mind such as data indexing and high-load frontend usage.

- [github](https://github.com/erpc/erpc)<br/>
- [docs](https://docs.erpc.cloud/)<br/>
- [telegram](https://t.me/erpc_cloud)<br/>

![Architecture](https://github.com/erpc/erpc/raw/main/assets/hla-diagram.svg)

# Quick start

1. Create your [`erpc.yaml`](https://docs.erpc.cloud/config/example) configuration file:

```yaml filename="erpc.yaml"
logLevel: debug
projects:
  - id: main
    upstreams:
      # You don't need to define architecture (e.g. evm) or chain id (e.g. 42161)
      # as they will be detected automatically by eRPC.
      - endpoint: https://arbitrum-one.blastapi.io/xxxx
      - endpoint: evm+alchemy://xxxx-my-alchemy-api-key-xxxx
```

See [a complete config example](https://docs.erpc.cloud/config/example) for inspiration.

2. Use the Docker image:

```bash
docker run -v $(pwd)/erpc.yaml:/root/erpc.yaml -p 4000:4000 -p 4001:4001 ghcr.io/erpc/erpc:latest
```

3. Send your first request:

```bash
curl --location 'http://localhost:4000/main/evm/42161' \
--header 'Content-Type: application/json' \
--data '{
    "method": "eth_getBlockByNumber",
    "params": [
        "0xe3eb1c4",
        false
    ],
    "id": 9199,
    "jsonrpc": "2.0"
}'
```

4. Bring up monitoring stack (Prometheus, Grafana) using docker-compose:

```bash
# clone the repo if you haven't
git clone https://github.com/erpc/erpc.git
cd erpc

# bring up the monitoring stack
docker-compose up -d
```

5. Open Grafana at [http://localhost:3000](http://localhost:3000) and login with the following credentials:

- username: `admin`
- password: `admin`

6. Send more requests and watch the metrics being collected and visualized in Grafana.

![eRPC Grafana Dashboard](https://docs.erpc.cloud/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmonitoring-example-erpc.2cb040a1.png&w=3840&q=75)
