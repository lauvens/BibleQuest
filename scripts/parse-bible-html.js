/**
 * Parse LSG 1910 HTML files and output JSON
 * Run with: node scripts/parse-bible-html.js > bible-data.json
 */

const fs = require("fs");
const path = require("path");

const sourceDir = "C:\\Users\\Lauvens\\Downloads\\bible";

// Map filenames to database book names
const bookNameMap = {
  "01.Genese": "Genèse",
  "02.Exode": "Exode",
  "03.Levitique": "Lévitique",
  "04.Nombres": "Nombres",
  "05.Deuteronome": "Deutéronome",
  "06.Josue": "Josué",
  "07.Juges": "Juges",
  "08.Ruth": "Ruth",
  "09.1Samuel": "1 Samuel",
  "10.2Samuel": "2 Samuel",
  "11.1Rois": "1 Rois",
  "12.2Rois": "2 Rois",
  "13.1Chroniques": "1 Chroniques",
  "14.2Chroniques": "2 Chroniques",
  "15.Esdras": "Esdras",
  "16.Nehemie": "Néhémie",
  "17.Esther": "Esther",
  "18.Job": "Job",
  "19.Psaumes": "Psaumes",
  "20.Proverbes": "Proverbes",
  "21.Ecclesiaste": "Ecclésiaste",
  "22.Cantique": "Cantique des Cantiques",
  "23.Esaie": "Ésaïe",
  "24.Jeremie": "Jérémie",
  "25.Lamentations": "Lamentations",
  "26.Ezechiel": "Ézéchiel",
  "27.Daniel": "Daniel",
  "28.Osee": "Osée",
  "29.Joel": "Joël",
  "30.Amos": "Amos",
  "31.Abdias": "Abdias",
  "32.Jonas": "Jonas",
  "33.Michee": "Michée",
  "34.Nahum": "Nahum",
  "35.Habacuc": "Habacuc",
  "36.Sophonie": "Sophonie",
  "37.Aggee": "Aggée",
  "38.Zacharie": "Zacharie",
  "39.Malachie": "Malachie",
  "40.Matthieu": "Matthieu",
  "41.Marc": "Marc",
  "42.Luc": "Luc",
  "43.Jean": "Jean",
  "44.Actes": "Actes",
  "45.Romains": "Romains",
  "46.1Corinthiens": "1 Corinthiens",
  "47.2Corinthiens": "2 Corinthiens",
  "48.Galates": "Galates",
  "49.Ephesiens": "Éphésiens",
  "50.Philippiens": "Philippiens",
  "51.Colossiens": "Colossiens",
  "52.1Thessaloniciens": "1 Thessaloniciens",
  "53.2Thessaloniciens": "2 Thessaloniciens",
  "54.1Timothee": "1 Timothée",
  "55.2Timothee": "2 Timothée",
  "56.Tite": "Tite",
  "57.Philemon": "Philémon",
  "58.Hebreux": "Hébreux",
  "59.Jacques": "Jacques",
  "60.1Pierre": "1 Pierre",
  "61.2Pierre": "2 Pierre",
  "62.1Jean": "1 Jean",
  "63.2Jean": "2 Jean",
  "64.3Jean": "3 Jean",
  "65.Jude": "Jude",
  "66.Apocalypse": "Apocalypse",
};

// Decode HTML entities
function decodeHtmlEntities(text) {
  const entities = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&agrave;": "à",
    "&acirc;": "â",
    "&auml;": "ä",
    "&ccedil;": "ç",
    "&egrave;": "è",
    "&eacute;": "é",
    "&ecirc;": "ê",
    "&euml;": "ë",
    "&icirc;": "î",
    "&iuml;": "ï",
    "&ocirc;": "ô",
    "&ouml;": "ö",
    "&ugrave;": "ù",
    "&ucirc;": "û",
    "&uuml;": "ü",
    "&Agrave;": "À",
    "&Acirc;": "Â",
    "&Auml;": "Ä",
    "&Ccedil;": "Ç",
    "&Egrave;": "È",
    "&Eacute;": "É",
    "&Ecirc;": "Ê",
    "&Euml;": "Ë",
    "&Icirc;": "Î",
    "&Iuml;": "Ï",
    "&Ocirc;": "Ô",
    "&Ouml;": "Ö",
    "&Ugrave;": "Ù",
    "&Ucirc;": "Û",
    "&Uuml;": "Ü",
    "&oelig;": "œ",
    "&OElig;": "Œ",
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.split(entity).join(char);
  }

  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, num) =>
    String.fromCharCode(parseInt(num, 10))
  );
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  return result;
}

function parseHtmlFile(filePath, bookName) {
  let content = fs.readFileSync(filePath, "utf-8");
  const verses = [];

  // Normalize: remove newlines and extra whitespace to make parsing easier
  content = content.replace(/\r?\n/g, " ").replace(/\s+/g, " ");

  // Multiple formats exist, try to handle them all
  // Pattern: <A NAME="chapter.verse"> followed eventually by <DD> and then the text

  // Split by verse anchors
  const parts = content.split(/<A NAME="(\d+)\.(\d+)">/i);

  // parts will be: [before, chapter, verse, after, chapter, verse, after, ...]
  for (let i = 1; i < parts.length; i += 3) {
    const chapter = parseInt(parts[i], 10);
    const verseNum = parseInt(parts[i + 1], 10);
    const afterAnchor = parts[i + 2];

    if (!afterAnchor) continue;

    // Find the text after <DD> and before the next <DT> or </DL>
    const ddMatch = afterAnchor.match(/<DD>\s*(?:&nbsp;)?\s*([\s\S]*?)(?=<DT>|<\/DL>|<H2>|$)/i);

    if (ddMatch) {
      let text = ddMatch[1];

      // Clean up the text
      text = text.replace(/<FONT[^>]*>([^<]*)<\/FONT>/gi, "$1");
      text = text.replace(/<[^>]+>/g, ""); // Remove any remaining HTML tags
      text = decodeHtmlEntities(text);
      text = text.replace(/\s+/g, " ").trim();

      if (text) {
        verses.push({
          book: bookName,
          chapter,
          verse: verseNum,
          text,
          translation: "LSG",
        });
      }
    }
  }

  return verses;
}

// Main
const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith(".html") && /^\d+\./.test(f));
const allVerses = [];

for (const file of files) {
  const baseName = file.replace(".html", "");
  const bookName = bookNameMap[baseName];

  if (!bookName) {
    console.error(`Unknown book: ${baseName}`);
    continue;
  }

  const filePath = path.join(sourceDir, file);
  const verses = parseHtmlFile(filePath, bookName);
  console.error(`${bookName}: ${verses.length} verses`);
  allVerses.push(...verses);
}

console.error(`\nTotal: ${allVerses.length} verses`);

// Output JSON
console.log(JSON.stringify(allVerses, null, 2));
