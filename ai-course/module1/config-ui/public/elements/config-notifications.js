/**
 * ConfigNotifications Custom Element
 * Listens to Server-Sent Events from /api/events to show toasts
 */
customElements.define('config-notifications', class extends HTMLElement {
    constructor() {
        super();
        this.eventSource = null;
    }

    connectedCallback() {
        this.connect();
    }

    disconnectedCallback() {
        if (this.eventSource) {
            this.eventSource.close();
        }
    }

    connect() {
        this.eventSource = new EventSource('/api/events');

        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Ignore initial connection message
                if (data.connected) return;

                // Handle Kafka config events
                if (data.eventType) {
                    const action = data.eventType.toUpperCase();
                    const key = data.data?.key || data.data?.params?.key || data.data?.params?.id || 'Configuration';
                    
                    console.log(`Notice: ${key} was ${action}`);
                    // Dispatch an event so the parent application can handle the UI updates
                    this.dispatchEvent(new CustomEvent('config-updated', {
                        bubbles: true,
                        composed: true,
                        detail: data
                    }));
                }
            } catch (err) {
                console.error('Error parsing notification event:', err);
            }
        };

        this.eventSource.onerror = (err) => {
            console.error('SSE Connection Error:', err);
            this.eventSource.close();
            // Try to reconnect after 5 seconds
            setTimeout(() => this.connect(), 5000);
        };
    }
});
