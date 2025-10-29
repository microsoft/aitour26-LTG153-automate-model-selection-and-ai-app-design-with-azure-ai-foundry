import base64
import json
import os
import time

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException, Request, status

load_dotenv()

AUTH_ENABLED = os.getenv("AUTH", "false").lower() == "true"
AUTH_URL = os.getenv("AUTH_URL", "")
APP_URL = os.getenv("APP_URL", "")
APP_NAME = os.getenv("APP_NAME", "")


def decode_token(token: str) -> dict:
    decoded_bytes = base64.b64decode(token)
    return json.loads(decoded_bytes)


async def validate_remote_token(raw_token: dict) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{AUTH_URL}/check/",
            headers={"x-token": raw_token["token"]},
            timeout=10,
        )
    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid")


async def require_auth(request: Request) -> dict | None:
    if not AUTH_ENABLED:
        return None

    auth_header = request.headers.get("Authorization") or ""
    query_token = request.query_params.get("t")

    token_value = ""
    if auth_header.startswith("Bearer "):
        token_value = auth_header.removeprefix("Bearer ")
    elif query_token:
        token_value = query_token

    if not token_value:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    token_payload = decode_token(token_value)

    if int(time.time() * 1000) > token_payload["expiry"]:
        await validate_remote_token(token_payload)

    request.state.auth = token_payload
    return token_payload


def auth_info() -> dict:
    return {
        "enabled": AUTH_ENABLED,
        "auth_url": AUTH_URL,
        "app_url": APP_URL,
        "app_name": APP_NAME,
    }
