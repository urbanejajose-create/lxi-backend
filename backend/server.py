"""
Compatibility entrypoint for deployments that still reference `server:app`.

The real application lives in `server_v2.py`. Keeping this thin wrapper avoids
publishing the legacy API by mistake.
"""

from server_v2 import app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
