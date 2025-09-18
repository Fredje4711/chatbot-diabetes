// 1. Globale variabele definiëren
let kennisbank = [];

// 2. Zoekfunctie gebruiken
function zoekKennisbank(vraag) {
  if (!vraag || !kennisbank.length) return [];

  const trefwoord = vraag.toLowerCase();

  const resultaten = kennisbank.filter(f =>
    f &&
    typeof f.tekst === 'string' &&
    f.tekst.toLowerCase().includes(trefwoord)
  );

  return resultaten.sort((a, b) => a.tekst.length - b.tekst.length);
}

// 3. Fetch uitvoeren om kennisbank-data in te laden
fetch("kb_index.json")
  .then(res => res.json())
  .then(data => {
    kennisbank = data;
    console.log("Kennisbank geladen:", kennisbank.length, "fragmenten.");
  })
  .catch(err => {
    console.error("Fout bij laden van kennisbank:", err);
  });
