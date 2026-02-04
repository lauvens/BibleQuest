/**
 * Script to import authentic LSG 1910 Bible from pre-parsed JSON
 * Run with: npx tsx scripts/import-lsg1910.ts
 */

import * as fs from "fs";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

async function importBible() {
  console.log("Starting LSG 1910 Bible import from JSON...");

  // Load pre-parsed JSON
  const jsonPath = "scripts/bible-data.json";
  const rawVerses: Verse[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Loaded ${rawVerses.length} verses from JSON`);

  // Deduplicate - keep first occurrence of each verse
  const seen = new Set<string>();
  const allVerses: Verse[] = [];
  for (const v of rawVerses) {
    const key = `${v.translation}:${v.book}:${v.chapter}:${v.verse}`;
    if (!seen.has(key)) {
      seen.add(key);
      allVerses.push(v);
    }
  }
  console.log(`After deduplication: ${allVerses.length} unique verses`);

  // Delete existing verses
  console.log("\nDeleting existing LSG verses...");
  const { error: deleteError } = await supabase
    .from("bible_verses")
    .delete()
    .eq("translation", "LSG");

  if (deleteError) {
    console.error("Error deleting existing verses:", deleteError);
    return;
  }
  console.log("Existing verses deleted.");

  // Insert in batches of 500
  console.log("\nInserting new verses...");
  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < allVerses.length; i += batchSize) {
    const batch = allVerses.slice(i, i + batchSize);
    const { error } = await supabase.from("bible_verses").insert(batch);

    if (error) {
      console.error(`\nError inserting batch at ${i}:`, error);
      console.error("First item in batch:", batch[0]);
      return;
    }

    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted}/${allVerses.length} verses`);
  }

  console.log("\n\nImport complete!");

  // Verify counts
  console.log("\nVerifying import...");
  const { count } = await supabase
    .from("bible_verses")
    .select("*", { count: "exact", head: true })
    .eq("translation", "LSG");

  console.log(`Total verses in database: ${count}`);
}

importBible();
