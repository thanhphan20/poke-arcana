## Why

The current Major Arcana assignment uses a hash function (`stableHash(id) % 22`) that produces **collisions** — multiple legendary/mythical Pokémon mapping to the same arcana slot. With Gen 1-3's 21 legendaries, only 14 of 22 Major Arcana slots are filled, leaving 8 arcana names unused. This requires expanding to Gen 1-7 (809 Pokémon, 70 legendaries) to fill all slots through sheer statistical coverage.

**Problem**: The user wants to limit the dataset to Gen 1-3 (386 Pokémon) to keep data size manageable, but the hash-based approach cannot fill all 22 slots with only 21 legendaries due to inevitable collisions.

**Solution**: Replace the hash-based assignment with a **rank-based sequential assignment** that maps legendaries to arcana slots based on their sorted position within the dataset. This eliminates collisions within a curated generation range and allows Gen 1-3's 21 legendaries to fill 21 of 22 slots (with 1 slot reserved for future expansion or special designation).

## What Changes

- **Replace hash-based Major Arcana assignment** with rank-based assignment: sort all legendary/mythical Pokémon by Pokédex ID and assign them sequentially to arcana slots (0, 1, 2, ..., 20 for Gen 1-3's 21 legendaries).
- **Update arcana-assignment algorithm** in `src/lib/arcana/majorArcana.ts` and `src/lib/arcana/index.ts` to compute arcana from a Pokémon's rank within the sorted legendary population, not from its ID hash.
- **Limit dataset to Gen 1-3** (Pokédex IDs 1-386) as the supported range.
- **Update design documentation** to reflect that this approach trades hash stability for collision elimination, and works best when the dataset is curated to a specific generation range.

## Capabilities

### Modified Capabilities
- `arcana-assignment`: Major Arcana assignment logic changes from `stableHash(id) % 22` to sequential rank-based mapping. The 22-slot array is now filled by sorting legendaries by ID and assigning arcana 0, 1, 2… in order. This is still deterministic (same dataset → same assignments) but eliminates collisions within the dataset.

### Design Trade-offs
**Before (hash-based):**
- ✅ Stable under dataset growth (adding Gen 4 never changes Gen 1-3 assignments)
- ✅ Works with any dataset size
- ❌ Inevitable collisions (multiple Pokémon → same arcana)
- ❌ Requires 70+ legendaries to fill all 22 slots

**After (rank-based):**
- ✅ No collisions within a curated generation range
- ✅ Works with Gen 1-3's 21 legendaries (fills 21/22 slots)
- ❌ Adding new generations changes rank order (not stable under growth)
- ❌ Requires re-syncing and re-committing data when generation range changes

## Impact

- **Source code changes**: `src/lib/arcana/majorArcana.ts`, `src/lib/arcana/index.ts`
- **Data regeneration**: `src/data/generated/pokemon.json` must be regenerated with Gen 1-3 dataset (DEX_END=386)
- **Breaking change**: Existing Gen 1-7 assignments will be completely remapped. This is acceptable since the project is not yet deployed to production.
- **Future expansion**: Adding Gen 4+ will require re-syncing and all legendary assignments will shift. This is a documented trade-off for collision-free assignment.
