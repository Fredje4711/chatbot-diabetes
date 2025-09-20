// ==== Verbeterde zoekfunctie voor de kennisbank ====

let kennisbank = [];

function zoekKennisbank(vraag) {
  if (!vraag || !kennisbank.length) return [];

  const trefwoorden = vraag
    .toLowerCase()
    .replace(/[.,!?;:"()]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2);

  const belangrijkeWoorden = ["contact", "e-mailadres", "mail", "adres", "naam", "voorzitter", "covoorzitter", "penningmeester", "bestuur", "bestuursleden"];

  const matchScore = (tekst) => {
    let score = 0;
    const txt = tekst.toLowerCase();

    // 1. Meer punten voor exacte trefwoorden
    trefwoorden.forEach(w => {
      if (txt.includes(w)) score += 1;
    });

    // 2. Extra punten voor belangrijke woorden
    belangrijkeWoorden.forEach(w => {
      if (txt.includes(w)) score += 2;
    });

    return score;
  };

  const resultaten = kennisbank
    .map(f => ({ ...f, score: matchScore(f.tekst || "") }))
    .filter(f => f.score > 0)
    .sort((a, b) => b.score - a.score || a.tekst.length - b.tekst.length);

  return resultaten;
}

fetch("kb_index.json")
  .then(res => res.json())
  .then(data => {
    kennisbank = data;
    console.log("📥 Kennisbank geladen:", kennisbank.length, "fragmenten.");
  })
  .catch(err => {
    console.error("❌ Fout bij laden van kennisbank:", err);
  });
