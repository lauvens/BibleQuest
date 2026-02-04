# Plan: Full Bible Reader with French Translation

## Status: COMPLETED ✅

## Overview
Import the complete Louis Segond 1910 French Bible and create a Bible reader interface with book/chapter navigation, integrated with the existing verse favorites system.

---

## Phase A: Database Schema

### A1. Create `bible_books` table
- **Migration:** Supabase
- Stores book metadata for navigation:
```sql
CREATE TABLE bible_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,           -- "Genèse", "Exode"
  abbreviation VARCHAR(10) NOT NULL,   -- "Gen", "Ex"
  testament VARCHAR(20) NOT NULL,      -- "old" or "new"
  order_index INTEGER NOT NULL,        -- 1-66 for canonical order
  chapters INTEGER NOT NULL,           -- Number of chapters in book
  UNIQUE(name),
  UNIQUE(order_index)
);
```

### A2. Add index to `bible_verses`
- **Migration:** Supabase
- Improve query performance:
```sql
CREATE INDEX idx_bible_verses_book_chapter ON bible_verses(book, chapter, verse);
CREATE INDEX idx_bible_verses_translation ON bible_verses(translation);
```

### A3. Update TypeScript types
- **Edit:** `src/types/database.ts`
- Add `bible_books` interface

---

## Phase B: Data Import

### B1. Source the Louis Segond Bible
- Use public domain LSG 1910 data
- Source: https://github.com/thiagobodruk/bible (JSON format) or similar
- Contains all 66 books, 1,189 chapters, 31,102 verses

### B2. Create import script
- **New:** `scripts/import-bible.ts`
- Parse JSON/CSV source
- Insert into `bible_books` (66 rows)
- Insert into `bible_verses` (~31,000 rows)
- Handle French book names properly

### B3. Run import
- Execute script against Supabase
- Verify counts match expected totals

---

## Phase C: Queries

### C1. Book queries
- **Edit:** `src/lib/supabase/queries.ts`
- Add:
  - `getBibleBooks()` - all books with metadata
  - `getBooksByTestament(testament: 'old' | 'new')` - filtered by testament

### C2. Chapter/verse queries
- **Edit:** `src/lib/supabase/queries.ts`
- Add:
  - `getChapter(book: string, chapter: number, translation?: string)` - all verses in chapter
  - `getChapterCount(book: string)` - number of chapters in book
  - `getVerseCount(book: string, chapter: number)` - verses in chapter

---

## Phase D: Bible Reader UI

### D1. Page structure
- **New:** `src/app/(main)/bible/page.tsx`
- Layout:
```
[Header: "La Bible" + translation badge]
[Testament Tabs: Ancien | Nouveau]
[Book Grid - grouped by testament]
```

### D2. Book selection page (default /bible view)
- **In:** `src/app/(main)/bible/page.tsx`
- Grid of book cards
- Grouped by testament (tabs or sections)
- Each card shows: book name, chapter count
- Click navigates to `/bible/[book]`

### D3. Chapter selection page
- **New:** `src/app/(main)/bible/[book]/page.tsx`
- Shows book name and chapter grid
- Grid of chapter numbers (1, 2, 3...)
- Click navigates to `/bible/[book]/[chapter]`

### D4. Chapter reading page
- **New:** `src/app/(main)/bible/[book]/[chapter]/page.tsx`
- Layout:
```
[Header: "Genèse 1" + navigation arrows]
[Verse list - each verse numbered]
[Prev/Next chapter buttons]
```
- Each verse shows:
  - Verse number (superscript)
  - Verse text
  - Favorite button (heart)
  - Copy button (on hover/tap)

---

## Phase E: Components

### E1. BookCard
- **New:** `src/components/bible/book-card.tsx`
- Displays book name, chapter count
- Testament color coding (olive for OT, info for NT)

### E2. ChapterGrid
- **New:** `src/components/bible/chapter-grid.tsx`
- Grid of chapter number buttons
- Responsive layout

### E3. VerseList
- **New:** `src/components/bible/verse-list.tsx`
- Displays verses for a chapter
- Integrates with favorites system
- Verse number styling

### E4. ChapterNav
- **New:** `src/components/bible/chapter-nav.tsx`
- Previous/Next chapter navigation
- Book + chapter display
- Jump to chapter dropdown

### E5. TestamentTabs
- **New:** `src/components/bible/testament-tabs.tsx`
- Toggle between Ancien/Nouveau Testament
- Badge with book count

---

## Phase F: Navigation Integration

### F1. Add to navigation
- **Edit:** `src/components/layout/bottom-nav.tsx`
- Consider: Replace "Versets" with "Bible" or keep both
- Icon: BookOpen or Bible icon

### F2. Link from home page
- **Edit:** `src/app/(main)/page.tsx`
- Add "Lire la Bible" button/card

### F3. Link from verse cards
- **Edit:** `src/components/verses/verse-card.tsx`
- Add "Lire en contexte" button
- Links to `/bible/[book]/[chapter]#verse-[number]`

---

## Phase G: Future Enhancements (Optional)

### G1. Multiple translations
- Add English (KJV - public domain)
- Translation switcher in header
- Store user preference

### G2. Reading plans
- Daily reading schedule
- Track progress
- Notifications

### G3. Audio Bible
- Text-to-speech integration
- Or link to audio resources

### G4. Cross-references
- Link related verses
- Study notes

---

## File Summary

| Action | File |
|--------|------|
| Migration | `bible_books` table |
| Migration | Indexes on `bible_verses` |
| New | `scripts/import-bible.ts` |
| Edit | `src/types/database.ts` |
| Edit | `src/lib/supabase/queries.ts` |
| New | `src/app/(main)/bible/page.tsx` |
| New | `src/app/(main)/bible/[book]/page.tsx` |
| New | `src/app/(main)/bible/[book]/[chapter]/page.tsx` |
| New | `src/components/bible/book-card.tsx` |
| New | `src/components/bible/chapter-grid.tsx` |
| New | `src/components/bible/verse-list.tsx` |
| New | `src/components/bible/chapter-nav.tsx` |
| New | `src/components/bible/testament-tabs.tsx` |
| Edit | `src/components/layout/bottom-nav.tsx` |
| Edit | `src/app/(main)/page.tsx` |
| Edit | `src/components/verses/verse-card.tsx` |

---

## Design Guidelines

### Colors
- Old Testament: `olive-*` palette
- New Testament: `info-*` palette
- Current chapter: `gold-*` highlight
- Verse numbers: `primary-400` (subtle)

### Typography
- Verse text: `.verse-text` (serif, for readability)
- Verse numbers: `text-xs font-medium` superscript
- Book titles: `font-bold text-lg`
- Chapter numbers: `font-semibold`

### Responsive
- Mobile: Single column, full-width cards
- Tablet: 2-column book grid, full chapter text
- Desktop: 3-4 column book grid, centered reading

---

## Verification Checklist

1. [x] `bible_books` table created with 66 books
2. [x] `bible_verses` contains ~31,000 verses
3. [x] Books display correctly by testament
4. [x] Chapter navigation works (prev/next)
5. [x] Verses display with proper formatting
6. [x] Favorites work on chapter page
7. [x] "Read in context" links work from verse cards
8. [x] Dark mode displays correctly
9. [x] Mobile responsive layout works
10. [x] `npm run build` passes

---

## Data Source

**Louis Segond 1910** (Public Domain)
- French Protestant translation
- Most widely used French Bible
- No copyright restrictions

Possible sources:
- https://github.com/thiagobodruk/bible (multi-language JSON)
- https://www.sacred-texts.com/bib/wb/fre/
- https://github.com/scrollmapper/bible_databases

---

## Estimated Scope

| Phase | Complexity |
|-------|------------|
| A. Database | Simple |
| B. Data Import | Medium |
| C. Queries | Simple |
| D. Pages | Medium |
| E. Components | Medium |
| F. Integration | Simple |
| **Total** | ~15-20 files |
