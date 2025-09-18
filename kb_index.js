let kennisbank = [];

function zoekKennisbank(vraag) {
  if (!vraag || !kennisbank.length) return [];

  const stopwoorden = [
    "de", "het", "een", "en", "of", "is", "zijn", "er", "in", "van", "wat", "welke", "hoe", "waar", "kan", "kunnen"
  ];

  const synoniemen = {
    infosessie: ["informatiesessie", "sessie", "sessies", "infosessies"],
    activiteit: ["activiteit", "activiteiten", "cultuur", "cultuuractiviteit"],
    diabetesliga: ["diabetes liga", "diabetes liga vlaanderen"],
    oktober: ["oktober", "15 oktober", "okt"],
    november: ["november", "14 november", "nov"]
  };

  let woorden = vraag.toLowerCase().split(/\s+/)
    .map(w => w.replace(/[.,!?]/g, '')) // leestekens verwijderen
    .filter(w => !stopwoorden.includes(w));

  // Voeg synoniemen toe aan de zoekwoorden
  let trefwoorden = [...woorden];
  woorden.forEach(w => {
    Object.entries(synoniemen).forEach(([basis, lijst]) => {
      if (lijst.includes(w) && !trefwoorden.includes(basis)) {
        trefwoorden.push(basis);
      }
    });
  });

  const resultaten = kennisbank.filter(f =>
    f &&
    typeof f.tekst === 'string' &&
    trefwoorden.some(w => f.tekst.toLowerCase().includes(w))
  );

  const top10 = resultaten.sort((a, b) => a.tekst.length - b.tekst.length).slice(0, 10);

  console.log("🔎 Vraag:", vraag);
  console.log("🔑 Sleutelwoorden:", trefwoorden);
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
