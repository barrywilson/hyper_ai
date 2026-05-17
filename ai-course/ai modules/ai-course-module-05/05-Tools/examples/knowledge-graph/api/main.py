"""Entry point for the knowledge-graph REST API."""

import uvicorn

from api.app import create_app

app = create_app()


def main() -> None:  # pragma: no cover
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=False)


if __name__ == "__main__":  # pragma: no cover
    main()
