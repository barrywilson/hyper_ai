import sqlite3
from pathlib import Path
import pytest
from cli.storage import (
    Storage,
    Node,
    Edge,
    NodeNotFoundError,
)


@pytest.fixture
def storage(tmp_path):
    db_path = tmp_path / "test.db"
    s = Storage(db_path)
    s.initialize_schema()
    return s


def test_schema_creates_nodes_and_edges_tables(storage):
    conn = sqlite3.connect(storage.db_path)
    tables = {row[0] for row in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()}
    assert "nodes" in tables
    assert "edges" in tables


def test_insert_and_lookup_node(storage):
    node = Node(
        id="application",
        type="domain_term",
        area="config_service",
        name="Application",
        definition="A managed unit identified by an application ID.",
        aliases=["app"],
        warnings=[],
        source_files=["svc/api/applications.py"],
        documentation=["docs/ABOUT.md"],
    )
    storage.insert_node(node)
    fetched = storage.lookup("application")
    assert fetched.id == "application"
    assert fetched.definition.startswith("A managed unit")
    assert fetched.aliases == ["app"]


def test_lookup_matches_alias(storage):
    storage.insert_node(Node(
        id="application", type="domain_term", area="config_service",
        name="Application", definition="…",
        aliases=["app", "tenant"], warnings=[], source_files=[], documentation=[],
    ))
    assert storage.lookup("app").id == "application"
    assert storage.lookup("tenant").id == "application"


def test_lookup_unknown_term_raises(storage):
    with pytest.raises(NodeNotFoundError):
        storage.lookup("nonexistent")


def test_get_related(storage):
    storage.insert_node(Node(id="a", type="t", area="x", name="A",
                             definition="", aliases=[], warnings=[],
                             source_files=[], documentation=[]))
    storage.insert_node(Node(id="b", type="t", area="x", name="B",
                             definition="", aliases=[], warnings=[],
                             source_files=[], documentation=[]))
    storage.insert_edge(Edge(from_node="a", to_node="b", relationship="related_to"))
    related = storage.get_related("a")
    assert len(related) == 1
    assert related[0].to_node == "b"
    assert related[0].relationship == "related_to"


def test_list_areas_returns_distinct(storage):
    storage.insert_node(Node(id="a", type="t", area="billing", name="A",
                             definition="", aliases=[], warnings=[],
                             source_files=[], documentation=[]))
    storage.insert_node(Node(id="b", type="t", area="billing", name="B",
                             definition="", aliases=[], warnings=[],
                             source_files=[], documentation=[]))
    storage.insert_node(Node(id="c", type="t", area="config_service", name="C",
                             definition="", aliases=[], warnings=[],
                             source_files=[], documentation=[]))
    areas = storage.list_areas()
    assert set(areas) == {"billing", "config_service"}


def test_validate_consistency_detects_orphan_edge(storage):
    storage.insert_node(Node(id="a", type="t", area="x", name="A",
                             definition="", aliases=[], warnings=[],
                             source_files=[], documentation=[]))
    storage.insert_edge(Edge(from_node="a", to_node="b_missing",
                              relationship="related_to"))
    issues = storage.validate_consistency()
    assert any("b_missing" in issue for issue in issues)


def test_validate_consistency_clean(storage):
    storage.insert_node(Node(id="a", type="t", area="x", name="A",
                             definition="", aliases=[], warnings=[],
                             source_files=[], documentation=[]))
    storage.insert_node(Node(id="b", type="t", area="x", name="B",
                             definition="", aliases=[], warnings=[],
                             source_files=[], documentation=[]))
    storage.insert_edge(Edge(from_node="a", to_node="b", relationship="related_to"))
    issues = storage.validate_consistency()
    assert issues == []
