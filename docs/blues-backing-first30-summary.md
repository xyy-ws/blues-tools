# Blues Backing Tracks - First 30 Batch Summary

## Scope
- Added **30 curated rows** to `docs/blues-backing-tracks-template.csv`.
- Priority followed: YouTube (Quist/Tom Bailey) + Wikiloops as main sources, with TrueFire as structured supplement.

## Source distribution
- Quist (YouTube): **10**
- Tom Bailey Backing Tracks (YouTube): **8**
- Wikiloops: **8**
- TrueFire Jam Tracks: **4**

## Key coverage
Covered all 12 target keys:
- E (5), A (4), D (4), C (3), G (3), B (2), Bb (2), C# (2), F (2), Ab (1), Eb (1), F# (1)

## BPM coverage
- Range: **65-128 BPM**
- Average: **90.6 BPM**
- Slow (60-75): **9**
- Medium (76-100): **14**
- Fast (101-130): **7**

## Meter coverage
- 4/4: **18**
- 12/8: **9**
- 6/8: **2**
- 3/4: **1**

## Quality split
- A: **14**
- B: **16**

## Items needing manual verification
- **28/30** entries include at least one uncertain field in notes (estimated BPM/duration/meter/key or URL slug verification).
- Method: flagged count = rows whose `notes` contain any uncertainty keyword (`estimated`, `verify`, `interpreted`, `assumed`).
- Main verification actions:
  1. Replace channel-level YouTube links with exact video URLs selected for final catalog.
  2. Confirm exact BPM/duration from source page/video description.
  3. Confirm TrueFire jam-track slugs resolve correctly.
  4. Confirm Wikiloops meter/key on items marked by feel/title.

## Validation checks
- CSV data rows (excluding header): **30**
- Empty `title`: **0**
- Empty `source_url`: **0**
- Duplicate titles: **0**
