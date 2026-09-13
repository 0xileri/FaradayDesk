# Bitget Qwen setup

Activated September 13, 2026. The gateway was verified with `qwen3.8-max`. FaradayDesk sets Responses `reasoning.effort=none`: the default consumed the 1,200-token output allowance entirely in reasoning and returned an incomplete response. Codex keeps its separate coding reasoning setting. Restart Codex to load the new provider and user environment variable.

Provider supplied by the hackathon: `https://hackathon.bitgetops.com/v1`, model `qwen3.8-max`, Responses protocol. Gateway compatibility and key eligibility must be verified with an authenticated request before switching production.

On Windows, run `powershell -NoProfile -File .\scripts\set-qwen-key.ps1` from the project folder. It prompts for the key without echoing it, saves a Windows user environment variable for Codex, and an ignored `.env.qwen` for setup. Never paste the key in chat or commit it. The environment variable and file are local credential storage, not an encrypted vault.

After the key is present, back up the existing Codex config and set these top-level values, preserving other settings:

```toml
model = "qwen3.8-max"
model_provider = "bitget-qwen"

[model_providers.bitget-qwen]
name = "Bitget Qwen"
base_url = "https://hackathon.bitgetops.com/v1"
env_key = "BITGET_QWEN_API_KEY"
wire_api = "responses"
```

Fully restart Codex after updating configuration and the environment variable. Existing conversations may retain their prior model selection; verify the provider in a new task.

For FaradayDesk, set server runtime variables together after a successful gateway test:
- `RESEARCH_API_URL=https://hackathon.bitgetops.com/v1/responses`
- `RESEARCH_MODEL=qwen3.8-max`
- `RESEARCH_WIRE_API=responses`
- `RESEARCH_API_KEY` to the Bitget-issued Qwen key (Railway protected environment variable).

The adapter preserves disclosure controls, source grounding and the 25/day, 200-total app quota. Codex usage shares the provider credits but is not counted by FaradayDesk's app quota. Responses requests set `store=false`; this does not establish the gateway's logging or retention policy. Claude remains compatible with `RESEARCH_WIRE_API=chat` (the default) and its original endpoint/key/model.

Official configuration reference: https://learn.chatgpt.com/docs/config-file/config-reference
