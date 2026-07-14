import { SPRITE_FALLBACK } from '../../lib/sprites';

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;
const DRAG_THRESHOLD = 6;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

class StarMap extends HTMLElement {
  private stageEl!: HTMLElement;
  private viewportEl!: HTMLElement;
  private canvasEl!: HTMLElement;
  private popupEl!: HTMLElement;
  private thumbEl!: HTMLImageElement;
  private symbolEl!: HTMLElement;
  private signEl!: HTMLElement;
  private dateRangeEl!: HTMLElement;
  private cardEl!: HTMLElement;
  private meaningEl!: HTMLElement;
  private activeBtn: HTMLButtonElement | null = null;
  private natalBtn: HTMLButtonElement | null = null;

  // ─── Zoom/pan state ──────────────────────────────────────────────────────
  private zoom = 1;
  private panX = 0;
  private panY = 0;
  private pointers = new Map<number, { x: number; y: number }>();
  private dragPointerId: number | null = null;
  private dragStartClient = { x: 0, y: 0 };
  private dragStartPan = { x: 0, y: 0 };
  private didDrag = false;
  private pinchStartDist = 0;
  private pinchStartZoom = 1;

  connectedCallback() {
    this.stageEl      = this.querySelector('[data-stage]') as HTMLElement;
    this.viewportEl   = this.querySelector('[data-viewport]') as HTMLElement;
    this.canvasEl     = this.querySelector('[data-canvas]') as HTMLElement;
    this.popupEl      = this.querySelector('[data-popup]') as HTMLElement;
    this.thumbEl      = this.querySelector('[data-popup-thumb]') as HTMLImageElement;
    this.symbolEl     = this.querySelector('[data-popup-symbol]') as HTMLElement;
    this.signEl       = this.querySelector('[data-popup-sign]') as HTMLElement;
    this.dateRangeEl  = this.querySelector('[data-popup-daterange]') as HTMLElement;
    this.cardEl       = this.querySelector('[data-popup-card]') as HTMLElement;
    this.meaningEl    = this.querySelector('[data-popup-meaning]') as HTMLElement;

    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onLocate = this.onLocate.bind(this);

    document.addEventListener('click', this.onDocumentClick);
    document.addEventListener('keydown', this.onKeydown);
    this.viewportEl.addEventListener('wheel', this.onWheel, { passive: false });
    this.viewportEl.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    window.addEventListener('star-map:locate', this.onLocate as EventListener);

    this.querySelectorAll<HTMLButtonElement>('.star-map__hotspot').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.didDrag) return;
        this.toggle(btn);
      });
    });

    this.querySelector('[data-popup-close]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });
    this.querySelector('[data-zoom-in]')?.addEventListener('click', () => this.zoomByFactor(1.3));
    this.querySelector('[data-zoom-out]')?.addEventListener('click', () => this.zoomByFactor(1 / 1.3));
    this.querySelector('[data-zoom-reset]')?.addEventListener('click', () => this.resetView());

    this.thumbEl.addEventListener('error', () => {
      this.thumbEl.onerror = null;
      this.thumbEl.src = SPRITE_FALLBACK;
    });

    this.centerView();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.onDocumentClick);
    document.removeEventListener('keydown', this.onKeydown);
    this.viewportEl.removeEventListener('wheel', this.onWheel);
    this.viewportEl.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    window.removeEventListener('star-map:locate', this.onLocate as EventListener);
  }

  // ─── Natal sign (from BirthForm) ───────────────────────────────────────────

  private onLocate(e: CustomEvent<{ sign: string | null }>) {
    const sign = e.detail?.sign ?? null;

    this.natalBtn?.classList.remove('is-natal');
    this.natalBtn = null;
    if (!sign) return;

    const btn = this.querySelector<HTMLButtonElement>(`.star-map__hotspot[data-sign="${sign}"]`);
    if (!btn) return;

    btn.classList.add('is-natal');
    this.natalBtn = btn;
    this.centerOn(btn);
    this.open(btn);
  }

  /** Pans/zooms so `btn`'s constellation is centered in the viewport. */
  private centerOn(btn: HTMLButtonElement) {
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = btn.offsetLeft + btn.offsetWidth / 2;
    const cy = btn.offsetTop + btn.offsetHeight / 2;

    this.zoom = clamp(1.3, MIN_ZOOM, MAX_ZOOM);
    this.panX = vpRect.width / 2 - cx * this.zoom;
    this.panY = vpRect.height / 2 - cy * this.zoom;
    this.applyTransform();
  }

  // ─── Popup ───────────────────────────────────────────────────────────────

  private toggle(btn: HTMLButtonElement) {
    if (this.activeBtn === btn) {
      this.close();
      return;
    }
    this.open(btn);
  }

  private open(btn: HTMLButtonElement) {
    this.activeBtn?.classList.remove('is-active');
    btn.classList.add('is-active');
    this.activeBtn = btn;

    const d = btn.dataset;
    this.thumbEl.src = d.thumb ?? SPRITE_FALLBACK;
    this.thumbEl.alt = d.card ?? '';
    this.symbolEl.textContent = d.symbol ?? '';
    this.signEl.textContent = d.sign ?? '';
    this.dateRangeEl.textContent = d.daterange ?? '';
    this.cardEl.textContent = d.card ?? '';
    this.meaningEl.textContent = d.meaning ?? '';

    this.popupEl.hidden = false;
    this.positionPopup(btn);
  }

  private positionPopup(btn: HTMLButtonElement) {
    const stageRect = this.stageEl.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    let leftPct = ((btnRect.left + btnRect.width / 2 - stageRect.left) / stageRect.width) * 100;
    let topPct = ((btnRect.top - stageRect.top) / stageRect.height) * 100;

    leftPct = clamp(leftPct, 12, 88);
    topPct = Math.max(14, topPct);

    this.popupEl.style.left = `${leftPct}%`;
    this.popupEl.style.top = `${topPct}%`;
  }

  private close() {
    this.activeBtn?.classList.remove('is-active');
    this.activeBtn = null;
    this.popupEl.hidden = true;
  }

  private onDocumentClick(e: Event) {
    if (this.didDrag) return;
    if (this.popupEl.hidden) return;
    const target = e.target as Node;
    if (this.popupEl.contains(target)) return;
    this.close();
  }

  private onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !this.popupEl.hidden) this.close();
  }

  // ─── Zoom / pan ──────────────────────────────────────────────────────────

  private applyTransform() {
    this.canvasEl.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    if (this.activeBtn) this.positionPopup(this.activeBtn);
  }

  /** Zoom to `newZoom`, keeping the canvas point under `screenPoint` fixed on screen. */
  private zoomTo(newZoom: number, screenPoint: { x: number; y: number }) {
    const rect = this.viewportEl.getBoundingClientRect();
    const mx = screenPoint.x - rect.left;
    const my = screenPoint.y - rect.top;
    const canvasX = (mx - this.panX) / this.zoom;
    const canvasY = (my - this.panY) / this.zoom;

    this.zoom = clamp(newZoom, MIN_ZOOM, MAX_ZOOM);
    this.panX = mx - canvasX * this.zoom;
    this.panY = my - canvasY * this.zoom;
    this.applyTransform();
  }

  private zoomByFactor(factor: number) {
    const rect = this.viewportEl.getBoundingClientRect();
    this.zoomTo(this.zoom * factor, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }

  private resetView() {
    this.centerView();
  }

  /** Centers the (larger-than-viewport) canvas in the viewport at zoom 1 — the
   * default/reset framing, so the map opens on a populated view instead of
   * the canvas's top-left corner. */
  private centerView() {
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cw = this.canvasEl.offsetWidth;
    const ch = this.canvasEl.offsetHeight;

    this.zoom = 1;
    this.panX = (vpRect.width - cw * this.zoom) / 2;
    this.panY = (vpRect.height - ch * this.zoom) / 2;
    this.applyTransform();
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    this.zoomTo(this.zoom * factor, { x: e.clientX, y: e.clientY });
  }

  private onPointerDown(e: PointerEvent) {
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size === 1) {
      this.dragPointerId = e.pointerId;
      this.dragStartClient = { x: e.clientX, y: e.clientY };
      this.dragStartPan = { x: this.panX, y: this.panY };
      this.didDrag = false;
    } else if (this.pointers.size === 2) {
      this.dragPointerId = null;
      const pts = [...this.pointers.values()];
      this.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      this.pinchStartZoom = this.zoom;
    }
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size >= 2) {
      const pts = [...this.pointers.values()].slice(0, 2);
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const newZoom = this.pinchStartZoom * (dist / this.pinchStartDist);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      this.didDrag = true;
      this.zoomTo(newZoom, mid);
      return;
    }

    if (this.dragPointerId === e.pointerId) {
      const dx = e.clientX - this.dragStartClient.x;
      const dy = e.clientY - this.dragStartClient.y;
      if (!this.didDrag && Math.hypot(dx, dy) > DRAG_THRESHOLD) this.didDrag = true;
      if (this.didDrag) {
        this.panX = this.dragStartPan.x + dx;
        this.panY = this.dragStartPan.y + dy;
        this.applyTransform();
      }
    }
  }

  private onPointerUp(e: PointerEvent) {
    this.pointers.delete(e.pointerId);
    if (this.dragPointerId === e.pointerId) this.dragPointerId = null;
  }
}

if (!customElements.get('star-map')) {
  customElements.define('star-map', StarMap);
}
