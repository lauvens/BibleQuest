/**
 * Import Louis Segond Bible into Supabase
 * Run with: npx tsx scripts/import-bible.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Set SUPABASE_SERVICE_ROLE_KEY in your environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map abbreviations from JSON to French book names
const BOOK_MAP: Record<string, string> = {
  gn: "Genèse",
  ex: "Exode",
  lv: "Lévitique",
  nm: "Nombres",
  dt: "Deutéronome",
  js: "Josué",
  jg: "Juges",
  rt: "Ruth",
  "1sm": "1 Samuel",
  "2sm": "2 Samuel",
  "1kgs": "1 Rois",
  "2kgs": "2 Rois",
  "1ch": "1 Chroniques",
  "2ch": "2 Chroniques",
  ezr: "Esdras",
  ne: "Néhémie",
  et: "Esther",
  job: "Job",
  ps: "Psaumes",
  prv: "Proverbes",
  eccl: "Ecclésiaste",
  so: "Cantique des Cantiques",
  is: "Ésaïe",
  jr: "Jérémie",
  lm: "Lamentations",
  ez: "Ézéchiel",
  dn: "Daniel",
  ho: "Osée",
  jl: "Joël",
  am: "Amos",
  ob: "Abdias",
  jn: "Jonas",
  mi: "Michée",
  na: "Nahum",
  hk: "Habacuc",
  zp: "Sophonie",
  hg: "Aggée",
  zc: "Zacharie",
  ml: "Malachie",
  mt: "Matthieu",
  mk: "Marc",
  lk: "Luc",
  jo: "Jean",
  act: "Actes",
  rm: "Romains",
  "1co": "1 Corinthiens",
  "2co": "2 Corinthiens",
  gl: "Galates",
  eph: "Éphésiens",
  ph: "Philippiens",
  cl: "Colossiens",
  "1ts": "1 Thessaloniciens",
  "2ts": "2 Thessaloniciens",
  "1tm": "1 Timothée",
  "2tm": "2 Timothée",
  tt: "Tite",
  phm: "Philémon",
  hb: "Hébreux",
  jm: "Jacques",
  "1pe": "1 Pierre",
  "2pe": "2 Pierre",
  "1jo": "1 Jean",
  "2jo": "2 Jean",
  "3jo": "3 Jean",
  jd: "Jude",
  re: "Apocalypse",
};

interface BibleBook {
  abbrev: string;
  chapters: string[][];
}

async function fetchBible(): Promise<BibleBook[]> {
  // Using a French Bible JSON source
  const response = await fetch(
    "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/fr_apee.json"
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch Bible: ${response.statusText}`);
  }
  return response.json();
}

async function clearExistingVerses() {
  console.log("Clearing existing verses...");
  const { error } = await supabase
    .from("bible_verses")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
  if (error) {
    console.error("Error clearing verses:", error);
  }
}

async function importBible() {
  console.log("Fetching Bible data...");
  const books = await fetchBible();
  console.log(`Found ${books.length} books`);

  // Clear existing verses first
  await clearExistingVerses();

  let totalVerses = 0;
  const batchSize = 500;
  let batch: {
    translation: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
  }[] = [];

  for (const book of books) {
    const bookName = BOOK_MAP[book.abbrev];
    if (!bookName) {
      console.warn(`Unknown book abbreviation: ${book.abbrev}`);
      continue;
    }

    console.log(`Processing ${bookName}...`);

    for (let chapterIdx = 0; chapterIdx < book.chapters.length; chapterIdx++) {
      const chapter = book.chapters[chapterIdx];
      const chapterNum = chapterIdx + 1;

      for (let verseIdx = 0; verseIdx < chapter.length; verseIdx++) {
        const verseText = chapter[verseIdx];
        const verseNum = verseIdx + 1;

        batch.push({
          translation: "LSG",
          book: bookName,
          chapter: chapterNum,
          verse: verseNum,
          text: verseText,
        });

        totalVerses++;

        // Insert in batches
        if (batch.length >= batchSize) {
          const { error } = await supabase.from("bible_verses").insert(batch);
          if (error) {
            console.error(`Error inserting batch:`, error);
          } else {
            console.log(`Inserted ${totalVerses} verses...`);
          }
          batch = [];
        }
      }
    }
  }

  // Insert remaining batch
  if (batch.length > 0) {
    const { error } = await supabase.from("bible_verses").insert(batch);
    if (error) {
      console.error(`Error inserting final batch:`, error);
    }
  }

  console.log(`\nImport complete! Total verses: ${totalVerses}`);
}

// Run the import
importBible().catch(console.error);
