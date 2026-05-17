# Feature Flags Design

## Goal

Define how feature flags should be introduced into the Configuration Service so module 3's active workflow story reflects a realistic next feature.

## Recommended Approach

Use the existing per-application configuration model as the persistence layer for feature flags. Treat feature flags as a structured subset of the configuration document rather than introducing a separate storage system in the first iteration.

This keeps the design aligned with the current architecture:
- the backend already reads and writes JSON configuration by application
- the UI already displays and edits application configuration
- the local `config-client` already retrieves configuration payloads for consuming applications

## Options Considered

### Option 1: Flags inside existing configuration documents
- **Pros**: Minimal schema churn, reuses repository and endpoint patterns, easiest migration path
- **Cons**: Requires clear validation to avoid unstructured flag sprawl
- **Recommendation**: Yes

### Option 2: Separate feature flag database table and endpoints
- **Pros**: Stronger domain separation, easier future rollout logic
- **Cons**: More migration work, more code surface, duplicates existing configuration capabilities
- **Recommendation**: No for the first iteration

### Option 3: Documentation-only pattern with no explicit service shape
- **Pros**: Lowest immediate effort
- **Cons**: Too vague for a workflow module intended to demonstrate planning and execution
- **Recommendation**: No

## Proposed Domain Model

Start with a deliberately narrow shape:

```json
{
  "feature_flags": {
    "new_dashboard": {
      "enabled": true,
      "description": "Enable the redesigned dashboard experience",
      "owner": "platform-team"
    }
  }
}
```

### Design rules
- Every flag key is unique within an application
- `enabled` is required and boolean
- `description` and `owner` are optional metadata
- Missing flags should be treated as "not configured", not silently equivalent to `false`
- More complex rollout fields should be deferred until a future story requires them

## API Direction

Two implementation paths are acceptable, with a slight preference for the first:

1. Add explicit feature-flag endpoints layered over the existing configuration store
2. Keep raw configuration endpoints and document a convention for the `feature_flags` section

Recommended path:
- preserve existing configuration endpoints
- add explicit feature-flag-oriented request/response shapes for clarity and validation

That gives the UI and client library a cleaner contract without forcing a new persistence model.

## UI Direction

The current UI should eventually expose a focused feature flag management workflow instead of requiring administrators to hand-edit raw JSON. A first implementation can remain simple:
- application list on the left
- selected application's feature flags on the right
- add/edit/toggle/delete interactions
- validation and clear error handling

## Testing Direction

The first implementation should prove:
- schema validation rejects malformed flag definitions
- endpoint behavior preserves existing configuration patterns
- UI editing flows work against the API contract
- the client library exposes predictable typed access patterns

## Non-Goals

This story does not require:
- percentage rollout
- audience targeting
- experimentation analytics
- cross-application inheritance

Those can be added later if a future work item justifies them.
