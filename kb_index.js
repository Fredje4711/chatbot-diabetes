let kennisbank = [];

function zoekKennisbank(vraag) {
  if (!vraag || !kennisbank.length) return [];

  const trefwoorden = vraag.toLowerCase().split(/\s+/);

  const resultaten = kennisbank.filter(f =>
    f &&
    typeof f.tekst === 'string' &&
    trefwoorden.some(w => f.tekst.toLowerCase().includes(w))
  );

  const top10 = resultaten.sort((a, b) => a.tekst.length - b.tekst.length).slice(0, 10);

  // DEBUGGING: toon in console welke fragmenten gematcht zijn
  console.log("🔎 Vraag:", vraag);
  console.log("📚 Gematchte fragmenten:", top10.map(f => f.titel || '(geen titel)'));

  return top10;
}

// Laad kennisbank
fetch("kb_index.json")
  .then(res => res.json())
  .then(data => {
    kennisbank = data;
    console.log("📥 Kennisbank geladen:", kennisbank.length, "fragmenten.");
  })
  .catch(err => {
    console.error("❌ Fout bij laden van kennisbank:", err);
  });
