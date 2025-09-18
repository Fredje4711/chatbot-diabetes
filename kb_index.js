// 1. Globale variabele voor de kennisbank
let kennisbank = [];

// 2. Zoekfunctie op basis van trefwoorden
function zoekKennisbank(vraag) {
  if (!vraag || !kennisbank.length) return [];

  console.log("🔎 Vraag:", vraag);

  // Verwerk de vraag in losse woorden
  const woorden = vraag
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && w !== "voor" && w !== "met" && w !== "wat" && w !== "welke");

  console.log("🔑 Sleutelwoorden:", woorden);

  // Zoek naar fragmenten die minstens één van de sleutelwoorden bevatten
  const resultaten = kennisbank.filter(f =>
    f &&
    typeof f.tekst === 'string' &&
    woorden.some(w => f.tekst.toLowerCase().includes(w))
  );

  console.log("📚 Gematchte fragmenten:", resultaten.map(r => r.tekst));

  // Geef maximaal 10 meest relevante (kortste eerst)
  return resultaten.sort((a, b) => a.tekst.length - b.tekst.length).slice(0, 10);
}

// 3. Laad de kennisbank uit JSON-bestand
fetch("kb_index.json")
  .then(res => res.json())
  .then(data => {
    kennisbank = data;
    console.log("📥 Kennisbank geladen:", kennisbank.length, "fragmenten.");
  })
  .catch(err => {
    console.error("❌ Fout bij laden van kennisbank:", err);
  });
