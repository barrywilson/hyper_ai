"""Stdio MCP server wrapping the knowledge-graph CLI."""

from __future__ import annotations

import anyio
from mcp.server.fastmcp import FastMCP

from stdio_server import tools


def build_server() -> FastMCP:
    server = FastMCP("domain-lang-mcp")

    @server.tool(
        name="ping",
        description=(
            "Connectivity sanity check. Returns 'Pong: <message>' echoing back "
            "whatever message you send. Use this to verify the MCP server is "
            "reachable before invoking real tools."
        ),
    )
    async def ping_tool(message: str) -> str:
        """Send a message to the server; receive an echo confirming the connection."""
        return await tools.ping(message)

    @server.tool(
        name="lookup_term",
        description=(
            "Look up the definition, aliases, warnings, and source-file references "
            "for a domain term in the knowledge graph. Pass the term, its alias, or "
            "its display name. Use this when the user mentions a domain concept and "
            "you need authoritative information about what it means in this codebase."
        ),
    )
    async def lookup_term_tool(term: str) -> str:
        """Return the JSON record for a term. Returns {'error': 'not_found'} if unknown."""
        return await tools.lookup_term(term)

    @server.tool(
        name="get_related_terms",
        description=(
            "List the relationships originating from a term in the knowledge graph. "
            "Use this when you've looked up a term and want to discover adjacent "
            "concepts, dependencies, or warnings stored as edges. Returns a list "
            "of {from, to, relationship} records."
        ),
    )
    async def get_related_terms_tool(term: str) -> str:
        return await tools.get_related_terms(term)

    @server.tool(
        name="list_domain_areas",
        description=(
            "List the distinct domain areas defined in the knowledge graph. Use "
            "this for orientation when you're unfamiliar with the codebase's "
            "domain partitioning. Returns a list of area strings."
        ),
    )
    async def list_domain_areas_tool() -> str:
        return await tools.list_domain_areas()

    @server.tool(
        name="validate_knowledge_graph",
        description=(
            "Check the knowledge graph for inconsistencies (orphan edges, missing "
            "node references). Returns {valid: bool, issues: list[str]}. Use this "
            "after editing YAML files to confirm the graph is still well-formed."
        ),
    )
    async def validate_knowledge_graph_tool() -> str:
        return await tools.validate_knowledge_graph()

    return server


def main() -> None:  # pragma: no cover
    server = build_server()
    anyio.run(server.run_stdio_async)


if __name__ == "__main__":  # pragma: no cover
    main()
