import pytest
from fastapi.testclient import TestClient

from api.app import create_app
from cli.importer import import_yaml_tree
from cli.storage import Storage


def test_health_returns_ok(tmp_path, monkeypatch):
    monkeypatch.setenv("KG_DB_PATH", str(tmp_path / "k.db"))
    Storage(tmp_path / "k.db").initialize_schema()
    client = TestClient(create_app())
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.fixture
def client(tmp_path, monkeypatch):
    (tmp_path / "knowledge" / "nodes").mkdir(parents=True)
    (tmp_path / "knowledge" / "edges").mkdir(parents=True)
    (tmp_path / "knowledge" / "nodes" / "core.yaml").write_text("""
nodes:
  - id: application
    name: Application
    area: config_service
    type: domain_term
    definition: A managed unit.
    aliases: [app]
""")
    (tmp_path / "knowledge" / "edges" / "core.yaml").write_text("""
edges:
  - from: application
    to: application
    relationship: self_loop_for_test
""")
    db = tmp_path / "k.db"
    s = Storage(db)
    s.initialize_schema()
    import_yaml_tree(tmp_path / "knowledge", s)
    monkeypatch.setenv("KG_DB_PATH", str(db))
    return TestClient(create_app())


def test_lookup_returns_node(client):
    response = client.get("/lookup", params={"term": "application"})
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "application"
    assert "app" in body["aliases"]


def test_lookup_unknown_returns_404(client):
    response = client.get("/lookup", params={"term": "nonexistent"})
    assert response.status_code == 404


def test_lookup_resolves_alias(client):
    response = client.get("/lookup", params={"term": "app"})
    assert response.status_code == 200
    assert response.json()["id"] == "application"


def test_related_returns_edges(client):
    response = client.get("/related", params={"term": "application"})
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["relationship"] == "self_loop_for_test"


def test_areas_returns_list(client):
    response = client.get("/areas")
    assert response.status_code == 200
    assert response.json() == ["config_service"]


def test_validate_returns_status(client):
    response = client.get("/validate")
    assert response.status_code == 200
    body = response.json()
    assert "valid" in body
    assert "issues" in body
