interface SpreadCard {
  id: number;
  slug: string;
  name: string;
  arcanaName: string;
  accent: string;
  sprite: string;
}

class SpreadReveal extends HTMLElement {
  private deck: SpreadCard[] = [];
  private results!: HTMLElement;
  private timers: number[] = [];

  connectedCallback() {
    const dataScript = this.querySelector<HTMLScriptElement>('script[type="application/json"]');
    if (dataScript?.textContent) {
      try {
        this.deck = JSON.parse(dataScript.textContent) as SpreadCard[];
      } catch {
        this.deck = [];
      }
    }

    const container = this.querySelector<HTMLElement>('[data-results]');
    if (!container) return;
    this.results = container;

    this.onDrawClick = this.onDrawClick.bind(this);
    document.addEventListener('click', this.onDrawClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.onDrawClick);
    this.clearTimers();
  }

  private onDrawClick(event: Event) {
    const target = event.target as HTMLElement | null;
    const trigger = target?.closest<HTMLElement>('[data-draw]');
    if (!trigger) return;
    const count = parseInt(trigger.dataset.draw ?? '', 10);
    if (Number.isFinite(count) && count > 0) this.draw(count);
  }

  private clearTimers() {
    for (const id of this.timers) clearTimeout(id);
    this.timers = [];
  }

  draw(count: number) {
    if (this.deck.length === 0) return;
    this.clearTimers();
    this.results.replaceChildren();

    const indices = this.deck.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const picked = indices.slice(0, Math.min(count, this.deck.length));
    const fragment = document.createDocumentFragment();

    for (const index of picked) {
      fragment.appendChild(this.buildCard(this.deck[index]));
    }
    this.results.appendChild(fragment);

    const cards = Array.from(this.results.querySelectorAll<HTMLElement>('[data-card]'));
    cards.forEach((card, i) => {
      const id = window.setTimeout(() => card.classList.add('flipped'), 120 + i * 140);
      this.timers.push(id);
    });
  }

  private buildCard(card: SpreadCard): HTMLElement {
    const scene = document.createElement('div');
    scene.className = 'spread-card';
    scene.dataset.card = '';
    scene.style.setProperty('--accent', card.accent);

    const inner = document.createElement('div');
    inner.className = 'spread-card__inner';

    const back = document.createElement('div');
    back.className = 'spread-card__face spread-card__back';
    back.innerHTML = `
      <svg viewBox="0 0 100 140" fill="none" aria-hidden="true">
        <circle cx="50" cy="70" r="30" stroke="currentColor" stroke-width="1.5" />
        <circle cx="50" cy="70" r="20" stroke="currentColor" stroke-width="0.8" opacity="0.6" />
        <path d="M50 30 L58 70 L50 110 L42 70 Z" fill="currentColor" opacity="0.5" />
        <path d="M20 70 L50 62 L80 70 L50 78 Z" fill="currentColor" opacity="0.5" />
        <circle cx="50" cy="70" r="4" fill="currentColor" />
      </svg>`;

    const front = document.createElement('div');
    front.className = 'spread-card__face spread-card__front';

    const img = document.createElement('img');
    img.src = card.sprite;
    img.alt = card.name;
    img.loading = 'lazy';
    img.className = 'spread-card__sprite';

    const name = document.createElement('p');
    name.className = 'spread-card__name';
    name.textContent = card.name;

    const arcana = document.createElement('p');
    arcana.className = 'spread-card__arcana';
    arcana.textContent = card.arcanaName;

    front.append(img, name, arcana);
    inner.append(back, front);
    scene.appendChild(inner);
    return scene;
  }
}

if (!customElements.get('spread-reveal')) {
  customElements.define('spread-reveal', SpreadReveal);
}
