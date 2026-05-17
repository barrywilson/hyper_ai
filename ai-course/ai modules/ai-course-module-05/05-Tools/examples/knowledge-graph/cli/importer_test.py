from pathlib import Path
import pytest
from cli.importer import import_yaml_tree, ImportError as KGImportError
from cli.storage import Storage


@pytest.fixture
def populated_tree(tmp_path):
    nodes = tmp_path / "knowledge" / "nodes"
    edges = tmp_path / "knowledge" / "edges"
    nodes.mkdir(parents=True)
    edges.mkdir(parents=True)
    (nodes / "config_service.yaml").write_text("""
nodes:
  - id: application
    type: domain_term
    area: config_service
    name: Application
    definition: A managed unit identified by an application ID.
    aliases: [app]
    warnings: []
    source_files: [svc/api/applications.py]
    documentation: [docs/ABOUT.md]
  - id: configuration_item
    type: domain_term
    area: config_service
    name: ConfigurationItem
    definition: A key/value pair scoped to an application and environment.
    aliases: [config item, config]
    warnings: [Do not confuse with feature flags]
    source_files: [svc/api/config.py]
    documentation: [docs/ABOUT.md]
""")
    (edges / "config_service.yaml").write_text("""
edges:
  - from: application
    to: configuration_item
    relationship: owns
""")
    return tmp_path


def test_import_loads_nodes_and_edges(populated_tree, tmp_path):
    db_path = tmp_path / "k.db"
    storage = Storage(db_path)
    storage.initialize_schema()
    result = import_yaml_tree(populated_tree / "knowledge", storage)
    assert result.nodes_imported == 2
    assert result.edges_imported == 1
    assert storage.lookup("application").id == "application"
    assert len(storage.get_related("application")) == 1


def test_import_rejects_malformed_yaml(tmp_path):
    nodes = tmp_path / "knowledge" / "nodes"
    nodes.mkdir(parents=True)
    (nodes / "bad.yaml").write_text("this is: not: valid: yaml: at: all")
    db_path = tmp_path / "k.db"
    storage = Storage(db_path)
    storage.initialize_schema()
    with pytest.raises(KGImportError) as exc_info:
        import_yaml_tree(tmp_path / "knowledge", storage)
    assert "bad.yaml" in str(exc_info.value)


def test_import_rejects_duplicate_node_id(tmp_path):
    nodes = tmp_path / "knowledge" / "nodes"
    nodes.mkdir(parents=True)
    (nodes / "a.yaml").write_text("""
nodes:
  - id: dup
    type: t
    area: x
    name: A
    definition: A
""")
    (nodes / "b.yaml").write_text("""
nodes:
  - id: dup
    type: t
    area: x
    name: B
    definition: B
""")
    db_path = tmp_path / "k.db"
    storage = Storage(db_path)
    storage.initialize_schema()
    with pytest.raises(KGImportError) as exc_info:
        import_yaml_tree(tmp_path / "knowledge", storage)
    assert "dup" in str(exc_info.value)
