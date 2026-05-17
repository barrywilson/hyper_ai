"""HTTP MCP server wrapping the knowledge-graph REST API."""

from __future__ import annotations

import anyio
from mcp.server.fastmcp import FastMCP

from http_server import tools


def build_server() -> FastMCP:
    server = FastMCP("domain-lang-mcp-http")

    @server.tool(name="ping", description="Connectivity sanity check.")
    async def ping_tool(message: str) -> str:
        return await tools.ping(message)

    @server.tool(
        name="lookup_term",
        description=(
            "Look up a domain term in the knowledge graph. Returns its definition, "
            "aliases, warnings, and source-file references."
        ),
    )
    async def lookup_term_tool(term: str) -> str:
        return await tools.lookup_term(term)

    @server.tool(
        name="get_related_terms",
        description=(
            "List edges from a term to other terms in the knowledge graph. Returns "
            "a list of {from, to, relationship} records."
        ),
    )
    async def get_related_terms_tool(term: str) -> str:
        return await tools.get_related_terms(term)

    @server.tool(
        name="list_domain_areas",
        description=(
            "List the distinct domain areas defined in the knowledge graph."
        ),
    )
    async def list_domain_areas_tool() -> str:
        return await tools.list_domain_areas()

    @server.tool(
        name="validate_knowledge_graph",
        description=(
            "Check the knowledge graph for inconsistencies. Returns "
            "{valid: bool, issues: list[str]}."
        ),
    )
    async def validate_knowledge_graph_tool() -> str:
        return await tools.validate_knowledge_graph()

    return server


def main() -> None:  # pragma: no cover
    server = build_server()
    anyio.run(server.run_streamable_http_async)


if __name__ == "__main__":  # pragma: no cover
    main()
