/**
 * Base Web Component class providing common functionality
 */
export abstract class BaseComponent extends HTMLElement {
  protected shadow: ShadowRoot;
  protected _isConnected = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this._isConnected = true;
    this.render();
  }

  disconnectedCallback(): void {
    this._isConnected = false;
  }

  protected abstract render(): void;

  /**
   * Tagged template that builds an HTML string and HTML-escapes every
   * interpolated value by default. Use `unsafeHtml(...)` to opt out for
   * values that are already-rendered HTML produced by this.html`...` (or
   * this.css`...`); never pass user-controlled strings to unsafeHtml.
   */
  protected html(strings: TemplateStringsArray, ...values: any[]): string {
    return strings.reduce((result, string, i) => {
      if (i >= values.length) {
        return result + string;
      }
      const raw = values[i];
      let rendered: string;
      if (raw === null || raw === undefined) {
        rendered = '';
      } else if (typeof raw === 'object' && raw !== null && '__unsafe' in raw) {
        rendered = String((raw as { __unsafe: string }).__unsafe);
      } else {
        rendered = this.escapeHtml(String(raw));
      }
      return result + string + rendered;
    }, '');
  }

  /**
   * Wrap a string of already-rendered HTML so the html`...` tag will not escape it.
   * Use ONLY for HTML you produced yourself via this.html`...` or this.css`...`.
   * Never pass user-controlled strings to this.
   */
  protected unsafeHtml(value: string): { __unsafe: string } {
    return { __unsafe: value };
  }

  // Escape order: `&` first to avoid double-encoding the entities introduced
  // by the later replacements. Assumes values land in either text or
  // double-quoted attribute contexts; single-quoted attributes would need
  // care since `'` becomes `&#39;` (correct in both contexts but worth
  // remembering).
  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  protected css(strings: TemplateStringsArray, ...values: any[]): string {
    return this.html(strings, ...values);
  }

  protected setHTML(html: string): void {
    this.shadow.innerHTML = html;
  }

  protected updateHTML(html: string): void {
    if (this._isConnected) {
      this.setHTML(html);
    }
  }

  // Keep querySelector methods public to maintain HTMLElement interface
  public querySelector<T extends Element>(selector: string): T | null {
    return this.shadow.querySelector<T>(selector);
  }

  public querySelectorAll<T extends Element>(selector: string): NodeListOf<T> {
    return this.shadow.querySelectorAll<T>(selector);
  }

  // Keep addEventListener public to maintain HTMLElement interface
  public addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  public addEventListener(
    type: string,
    listener: (this: HTMLElement, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  public addEventListener(
    type: string,
    listener: (this: HTMLElement, ev: any) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    super.addEventListener(type, listener, options);
  }

  protected emit<T = any>(eventName: string, detail?: T): void {
    this.dispatchEvent(new CustomEvent(eventName, { 
      detail, 
      bubbles: true, 
      composed: true 
    }));
  }
}