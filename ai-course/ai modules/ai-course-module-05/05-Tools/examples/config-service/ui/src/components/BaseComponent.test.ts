import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BaseComponent } from './BaseComponent';

// Test implementation of BaseComponent
class TestComponent extends BaseComponent {
  protected render(): void {
    this.setHTML(this.html`
      <div class="test-component">
        <h1>Test Component</h1>
        <button>Click me</button>
      </div>
    `);
  }

  public getRenderHTML(): string {
    return this.html`<p>Test HTML: ${'value'}</p>`;
  }

  public getRenderCSS(): string {
    return this.css`
      .test { color: ${'red'}; }
    `;
  }

  public triggerCustomEvent(): void {
    this.emit('test-event', { data: 'test' });
  }

  public updateComponent(): void {
    this.updateHTML('<div>Updated</div>');
  }
}

describe('BaseComponent', () => {
  let component: TestComponent;

  beforeEach(() => {
    // Define custom element if not already defined
    if (!customElements.get('test-component')) {
      customElements.define('test-component', TestComponent);
    }
    
    component = new TestComponent();
    document.body.appendChild(component);
  });

  afterEach(() => {
    document.body.removeChild(component);
  });

  describe('Shadow DOM setup', () => {
    it('should create shadow root in open mode', () => {
      expect(component.shadowRoot).toBeTruthy();
      expect(component.shadowRoot?.mode).toBe('open');
    });

    it('should attach shadow root on construction', () => {
      const newComponent = new TestComponent();
      expect(newComponent.shadowRoot).toBeTruthy();
    });
  });

  describe('Lifecycle methods', () => {
    it('should set _isConnected to true when connected', () => {
      expect(component['_isConnected']).toBe(true);
    });

    it('should call render when connected', () => {
      const newComponent = new TestComponent();
      const renderSpy = vi.spyOn(newComponent as any, 'render');
      document.body.appendChild(newComponent);
      
      expect(renderSpy).toHaveBeenCalled();
      
      document.body.removeChild(newComponent);
    });

    it('should set _isConnected to false when disconnected', () => {
      const newComponent = new TestComponent();
      document.body.appendChild(newComponent);
      expect(newComponent['_isConnected']).toBe(true);
      
      document.body.removeChild(newComponent);
      expect(newComponent['_isConnected']).toBe(false);
    });
  });

  describe('Template helpers', () => {
    it('should interpolate values in html template', () => {
      const result = component.getRenderHTML();
      expect(result).toBe('<p>Test HTML: value</p>');
    });

    it('should handle empty values in html template', () => {
      const result = component['html']`<div>${undefined}</div>`;
      expect(result).toBe('<div></div>');
    });

    it('should interpolate values in css template', () => {
      const result = component.getRenderCSS();
      expect(result).toBe('\n      .test { color: red; }\n    ');
    });
  });

  describe('DOM manipulation', () => {
    it('should set HTML content in shadow root', () => {
      component['setHTML']('<div>Test Content</div>');
      expect(component.shadowRoot?.innerHTML).toBe('<div>Test Content</div>');
    });

    it('should update HTML when connected', () => {
      component.updateComponent();
      expect(component.shadowRoot?.innerHTML).toBe('<div>Updated</div>');
    });

    it('should not update HTML when disconnected', () => {
      const originalHTML = component.shadowRoot?.innerHTML;
      document.body.removeChild(component);
      component.updateComponent();
      
      // Re-add to check content hasn't changed
      document.body.appendChild(component);
      expect(component.shadowRoot?.innerHTML).toBe(originalHTML);
    });
  });

  describe('Query selectors', () => {
    beforeEach(() => {
      component['render'](); // Ensure component is rendered
    });

    it('should query elements in shadow DOM', () => {
      const button = component.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Click me');
    });

    it('should query all elements in shadow DOM', () => {
      const elements = component.querySelectorAll('*');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent elements', () => {
      const element = component.querySelector('.non-existent');
      expect(element).toBeNull();
    });
  });

  describe('Event handling', () => {
    it('should emit custom events', async () => {
      const eventPromise = new Promise<CustomEvent>((resolve) => {
        component.addEventListener('test-event', (event: Event) => {
          resolve(event as CustomEvent);
        });
      });

      component.triggerCustomEvent();

      const customEvent = await eventPromise;
      expect(customEvent.detail).toEqual({ data: 'test' });
      expect(customEvent.bubbles).toBe(true);
      expect(customEvent.composed).toBe(true);
    });

    it('should support standard event listeners', () => {
      const clickHandler = vi.fn();
      component.addEventListener('click', clickHandler);
      
      const clickEvent = new Event('click');
      component.dispatchEvent(clickEvent);
      
      expect(clickHandler).toHaveBeenCalled();
    });
  });

  describe('Abstract method contract', () => {
    it('should require render method implementation', () => {
      // This test ensures the abstract contract is working
      expect(() => {
        component['render']();
      }).not.toThrow();
    });
  });
});

class EscapingTestComponent extends BaseComponent {
  protected render(): void {}

  public testHtml(strings: TemplateStringsArray, ...values: unknown[]): string {
    return this.html(strings, ...values);
  }

  public testUnsafeHtml(value: string): { __unsafe: string } {
    return this.unsafeHtml(value);
  }
}

describe('BaseComponent.html escaping', () => {
  let comp: EscapingTestComponent;

  beforeEach(() => {
    if (!customElements.get('escaping-test-component')) {
      customElements.define('escaping-test-component', EscapingTestComponent);
    }
    comp = new EscapingTestComponent();
    document.body.appendChild(comp);
  });

  it('escapes <, >, &, ", \' in interpolated text', () => {
    const dangerous = `<img src=x onerror=alert(1)> & "quote" 'apos'`;
    const result = comp.testHtml`<div>${dangerous}</div>`;
    expect(result).not.toContain('<img');
    expect(result).toContain('&lt;img');
    expect(result).toContain('&amp;');
    expect(result).toContain('&quot;');
    expect(result).toContain('&#39;');
  });

  it('does not escape values wrapped in unsafeHtml()', () => {
    const trustedHtml = '<span class="ok">already-rendered</span>';
    const result = comp.testHtml`<div>${comp.testUnsafeHtml(trustedHtml)}</div>`;
    expect(result).toContain('<span class="ok">');
  });

  it('treats null and undefined as empty string', () => {
    const result = comp.testHtml`<div>${null}|${undefined}</div>`;
    expect(result).toBe('<div>|</div>');
  });
});