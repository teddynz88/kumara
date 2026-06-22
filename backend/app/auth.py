"""Auth dependency — every AI endpoint requires a signed-in Supabase user.

This both scopes data to the right person AND closes the "anyone with the
public URL can spend the Claude API key" hole: no valid login, no AI call.

We verify the bearer token by asking Supabase who it belongs to
(GET /auth/v1/user). A 200 means it's a real, unexpired session.
"""

from typing import Optional

import httpx
from fastapi import Header, HTTPException

from . import config


class AuthedUser:
    """The verified caller — their id and the raw token to forward to PostgREST."""

    def __init__(self, user_id: str, token: str):
        self.id = user_id
        self.token = token


async def require_user(authorization: Optional[str] = Header(default=None)) -> AuthedUser:
    if not config.SUPABASE_URL or not config.SUPABASE_ANON_KEY:
        # Misconfigured backend — don't pretend the user is the problem.
        raise HTTPException(500, "The server isn't configured for sign-in yet.")

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Please sign in to use this feature.")
    token = authorization.split(" ", 1)[1].strip()

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{config.SUPABASE_URL}/auth/v1/user",
                headers={"apikey": config.SUPABASE_ANON_KEY, "Authorization": f"Bearer {token}"},
                timeout=8.0,
            )
        except httpx.HTTPError as exc:
            raise HTTPException(503, "Couldn't verify your sign-in just now — try again.") from exc

    if resp.status_code != 200:
        raise HTTPException(401, "Your session has expired — please sign in again.")

    user = resp.json()
    return AuthedUser(user_id=user.get("id", ""), token=token)
