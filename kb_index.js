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
