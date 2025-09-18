let kennisbank = [];

// Laad de JSON-index bij opstart
fetch("kb_index.json")
  .then(res => res.json())
  .then(data => {
    kennisbank = data;
  })
  .catch(err => {
    console.error("Fout bij laden van kennisbank:", err);
  });

// Zoek relevante fragmenten in de KB
function zoekKennisbank(vraag) {
  if (!vraag || !kennisbank.length) return [];

  const trefwoord = vraag.toLowerCase();
  const resultaten = kennisbank.filter(f =>
    f.tekst.toLowerCase().includes(trefwoord)
  );

  // Sorteer op lengte (optioneel) of relevantie
  return resultaten.sort((a, b) => a.tekst.length - b.tekst.length);
}
