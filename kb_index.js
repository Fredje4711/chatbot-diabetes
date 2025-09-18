let kennisbank = [];

function zoekKennisbank(vraag) {
  if (!vraag || !kennisbank.length) return [];

  const trefwoorden = vraag.toLowerCase().split(/\s+/);

  const resultaten = kennisbank.filter(f =>
    f &&
    typeof f.tekst === 'string' &&
    trefwoorden.some(w => f.tekst.toLowerCase().includes(w))
  );

  // Sorteer op lengte en pak top 10
  return resultaten.sort((a, b) => a.tekst.length - b.tekst.length).slice(0, 10);
}

// Laad kennisbank
fetch("kb_index.json")
  .then(res => res.json())
  .then(data => {
    kennisbank = data;
    console.log("Kennisbank geladen:", kennisbank.length, "fragmenten.");
  })
  .catch(err => {
    console.error("Fout bij laden van kennisbank:", err);
  });
