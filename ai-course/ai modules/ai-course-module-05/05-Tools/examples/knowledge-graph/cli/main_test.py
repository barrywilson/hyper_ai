import json
from pathlib import Path

from typer.testing import CliRunner

from cli.main import app


def write_minimal_knowledge(root: Path):
    (root / "knowledge" / "nodes").mkdir(parents=True)
    (root / "knowledge" / "edges").mkdir(parents=True)
    (root / "knowledge" / "nodes" / "core.yaml").write_text("""
nodes:
  - id: a
    name: A
    area: x
    type: t
    definition: alpha
  - id: b
    name: B
    area: x
    type: t
    definition: beta
""")
    (root / "knowledge" / "edges" / "core.yaml").write_text("""
edges:
  - from: a
    to: b
    relationship: related_to
""")


def test_import_command_succeeds(tmp_path, monkeypatch):
    write_minimal_knowledge(tmp_path)
    monkeypatch.chdir(tmp_path)
    runner = CliRunner()
    result = runner.invoke(app, ["import"])
    assert result.exit_code == 0, result.stdout
    assert "imported 2 nodes" in result.stdout
    assert "imported 1 edge" in result.stdout
    assert (tmp_path / "knowledge.db").exists()


def test_validate_command_clean(tmp_path, monkeypatch):
    write_minimal_knowledge(tmp_path)
    monkeypatch.chdir(tmp_path)
    runner = CliRunner()
    runner.invoke(app, ["import"])
    result = runner.invoke(app, ["validate"])
    assert result.exit_code == 0, result.stdout
    assert "valid" in result.stdout.lower()


def test_validate_command_reports_orphan(tmp_path, monkeypatch):
    write_minimal_knowledge(tmp_path)
    (tmp_path / "knowledge" / "edges" / "core.yaml").write_text("""
edges:
  - from: a
    to: missing
    relationship: related_to
""")
    monkeypatch.chdir(tmp_path)
    runner = CliRunner()
    runner.invoke(app, ["import"])
    result = runner.invoke(app, ["validate"])
    assert result.exit_code != 0
    assert "missing" in result.stdout


def setup_kg(tmp_path, monkeypatch):
    (tmp_path / "knowledge" / "nodes").mkdir(parents=True)
    (tmp_path / "knowledge" / "edges").mkdir(parents=True)
    (tmp_path / "knowledge" / "nodes" / "core.yaml").write_text("""
nodes:
  - id: application
    name: Application
    area: config_service
    type: domain_term
    definition: A managed unit identified by an application ID.
    aliases: [app]
  - id: configuration_item
    name: ConfigurationItem
    area: config_service
    type: domain_term
    definition: A key/value pair.
""")
    (tmp_path / "knowledge" / "edges" / "core.yaml").write_text("""
edges:
  - from: application
    to: configuration_item
    relationship: owns
""")
    monkeypatch.chdir(tmp_path)
    CliRunner().invoke(app, ["import"])


def test_lookup_json(tmp_path, monkeypatch):
    setup_kg(tmp_path, monkeypatch)
    result = CliRunner().invoke(app, ["lookup", "application", "--format", "json"])
    assert result.exit_code == 0
    payload = json.loads(result.stdout)
    assert payload["id"] == "application"
    assert payload["definition"].startswith("A managed unit")
    assert "app" in payload["aliases"]


def test_lookup_unknown_term_exits_nonzero(tmp_path, monkeypatch):
    setup_kg(tmp_path, monkeypatch)
    result = CliRunner().invoke(app, ["lookup", "nonexistent", "--format", "json"])
    assert result.exit_code != 0
    payload = json.loads(result.stdout)
    assert payload["error"] == "not_found"
    assert payload["term"] == "nonexistent"


def test_related_json(tmp_path, monkeypatch):
    setup_kg(tmp_path, monkeypatch)
    result = CliRunner().invoke(app, ["related", "application", "--format", "json"])
    assert result.exit_code == 0
    payload = json.loads(result.stdout)
    assert isinstance(payload, list)
    assert payload[0]["to"] == "configuration_item"
    assert payload[0]["relationship"] == "owns"


def test_list_areas_json(tmp_path, monkeypatch):
    setup_kg(tmp_path, monkeypatch)
    result = CliRunner().invoke(app, ["list-areas", "--format", "json"])
    assert result.exit_code == 0
    payload = json.loads(result.stdout)
    assert payload == ["config_service"]


def test_lookup_alias_resolves(tmp_path, monkeypatch):
    setup_kg(tmp_path, monkeypatch)
    result = CliRunner().invoke(app, ["lookup", "app", "--format", "json"])
    assert result.exit_code == 0
    payload = json.loads(result.stdout)
    assert payload["id"] == "application"
