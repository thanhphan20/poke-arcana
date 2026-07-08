## Data pipeline record counts

- **Gen 1-3 dataset**: 386 Pokémon (21 legendary/mythical)
- **Legendary/mythical count**: 21 (sufficient for 21/22 Major Arcana slots)
- **Major Arcana coverage**: 21 of 22 slots (slot 21 remains unfilled)

## Spot-checks

### Verify no collisions in Gen 1-3
```bash
node -e "
const data = require('./src/data/generated/pokemon.json');
const majors = data.filter(p => p.arcana.kind === 'major');
const names = majors.map(p => p.arcana.name);
const uniqueNames = [...new Set(names)];
console.log('Major count:', majors.length);
console.log('Unique arcana:', uniqueNames.length);
console.log('Missing:', 22 - uniqueNames.length, 'slots');
console.log('Duplicates:', majors.length - uniqueNames.length);
"
```

Expected: 21 legendaries, 21 unique arcana names, 1 missing slot.

### Verify deterministic assignment
```bash
DEX_START=1 DEX_END=386 bun run sync
git diff src/data/generated/pokemon.json | head -20
```

Expected: No changes if run again (same dataset → same assignments).

### Build verification
```bash
bun run build
```

Expected: Build completes successfully with 389 pages (386 deck cards + 3 index pages).
