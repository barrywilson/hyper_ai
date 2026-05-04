# Re-enable Kafka & Notifications

This plan outlines the steps to re-enable Kafka event streaming, publish events upon data changes, and stream those events down to the UI using a new custom element.

## User Review Required
- We will use **Server-Sent Events (SSE)** to stream Kafka messages from `server.js` down to the browser. SSE is native to HTTP and doesn't require extra heavy dependencies (like `socket.io`), keeping in line with the Anti-Bloatware rules. 

## Proposed Changes

### Backend (Kafka & API)
#### [MODIFY] `kafka.js`
- Change consumer subscription from `topic: 'test'` to `topic: 'config-events'` to match the producer.
- Implement a Node.js `EventEmitter` to bubble consumed Kafka messages up to `server.js`.

#### [MODIFY] `server.js`
- Uncomment Kafka initialization and shutdown hooks.
- In `app.post('/api/resolve')`, if `action` is `create`, `update`, or `delete` and the result is successful, call `kafka.publishEvent(action, params)`.
- Add an SSE endpoint `app.get('/api/events')` that keeps HTTP connections open and pushes consumed Kafka messages to connected browsers.

---

### Frontend (UI Elements)
#### [NEW] `public/elements/config-notifications.js`
- Create a `<config-notifications>` custom element.
- It will establish an `EventSource` connection to `/api/events`.
- When an event is received, it will trigger an `appLayout.ShowMessage(...)` toast to alert the user of the change.

#### [MODIFY] `public/admin.html` & `public/index.html`
- Include the new `<script src="elements/config-notifications.js"></script>`.
- Add the `<config-notifications></config-notifications>` tag into the DOM so it silently runs in the background and catches events.

## Verification Plan
1. Start the Docker containers (Zookeeper, Kafka, backend API, config-ui).
2. Open `admin.html` in one browser tab, and `index.html` in another.
3. Make a change in `admin.html` (e.g., add a new config).
4. Verify that:
   - `server.js` publishes a Kafka event.
   - `kafka.js` consumer receives the event.
   - The SSE stream pushes it to the browsers.
   - The `<config-notifications>` element shows a pop-up toast on both tabs.
