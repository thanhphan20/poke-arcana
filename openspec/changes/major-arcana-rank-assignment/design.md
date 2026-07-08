## Context

The original design used a hash-based Major Arcana assignment to ensure stability under dataset growth: adding new generations would never reshuffle existing Pokémon's arcana assignments. This stability came at the cost of **inevitable hash collisions** — multiple legendaries mapping to the same arcana slot.

With Gen 1-3's 21 legendary/mythical Pokémon, the hash function produces 7 collisions, leaving only 14 of 22 Major Arcana slots filled. The user wants to limit the dataset to Gen 1-3 (smaller data size) while filling all available arcana slots without collisions.

## Goals / Non-Goals

**Goals:**
- Eliminate Major Arcana collisions within Gen 1-3 dataset
- Keep dataset size manageable (Gen 1-3: 386 Pokémon vs Gen 1-7: 809 Pokémon)
- Maintain deterministic assignment (same input data → same arcana output)

**Non-Goals:**
- Stability under dataset growth (adding Gen 4+ will re-order rank assignments)
- Hand-curation of which Pokémon gets which specific arcana (still algorithmic)
- Supporting multiple generation ranges simultaneously

## Decisions

**Rank-based sequential assignment instead of hash modulo.**
Instead of `stableHash(pokedexId) % 22`, we sort all legendary/mythical Pokémon by Pokédex ID and assign them to arcana slots sequentially: rank 0 → The Fool, rank 1 → The Magician, etc. Gen 1-3's 21 legendaries fill slots 0-20, leaving slot 21 (The World) for future designation.

**Trade-off: collision elimination vs growth stability.**
The hash approach was stable (adding Gen 4 never changed Gen 1-3 assignments) but produced collisions. The rank approach is collision-free within a generation range but unstable across expansions (adding Gen 4 changes rank order for all legendaries). This is acceptable because:
1. The user explicitly wants Gen 1-3 only
2. The project is not yet in production (no existing user expectations to preserve)
3. Future expansion will be a documented data regeneration step, not a silent background change

**Still deterministic, not hand-curated.**
The assignment is still fully algorithmic: given a dataset, sort legendaries by ID, assign sequentially. No manual "Mewtwo should be The Tower" decisions. The algorithm can be reused with any dataset; the constraint is that *changing* the dataset changes the output.

## Risks / Trade-offs

- **[Unstable under growth]** Adding Gen 4+ legendaries will shift all rank assignments. **Mitigation**: Document this in README and AGENTS.md as a known limitation; treat dataset expansion as a major version change that requires regeneration.
- **[Slot 21 unfilled in Gen 1-3]** Gen 1-3 has 21 legendaries; slot 21 (The World) will remain unfilled. **Mitigation**: Accept as expected behavior; the slot can be designated for future expansion or a special "honorary Major Arcana" rule later.
- **[Breaks existing Gen 1-7 data]** Current branch has Gen 1-5 data with hash-based assignments. **Mitigation**: This is a pre-production change; no users are affected.

## Migration Plan

1. Update `src/lib/arcana/majorArcana.ts` to remove `stableHash()` and replace `majorArcanaFor(id)` with `majorArcanaForRank(rank)`.
2. Update `src/lib/arcana/index.ts` to sort legendaries by ID, compute rank, and pass rank to `majorArcanaForRank()`.
3. Run `DEX_START=1 DEX_END=386 bun run sync` to regenerate Gen 1-3 dataset.
4. Verify all 21 legendaries get unique arcana slots 0-20.
5. Update AGENTS.md and README.md to document the rank-based approach and generation-range constraint.
6. Commit and push updated code + data.

## Open Questions

None blocking implementation. Deferred: whether to designate a 22nd Pokémon for slot 21 (e.g., Dragonite as "honorary legendary") or leave it empty.
