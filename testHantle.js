const fs = require("fs");
const cwiczenia = JSON.parse(fs.readFileSync("./src/app/lib/data/lista_cwiczen.json", "utf8"));
const dozwolone = ["steppery", "hantle", "sztangi", "sztanga", "maty", "sztangi 5kg"];

const validDlaAstorii = cwiczenia.filter(ex => {
  if (!ex.wymagany_sprzet) return true;
  const rawReqs = Array.isArray(ex.wymagany_sprzet) ? ex.wymagany_sprzet : [ex.wymagany_sprzet];
  const reqs = rawReqs.flatMap(r => String(r).split(",").map(s => s.trim().toLowerCase()));

  for (const req of reqs) {
    if (req === "" || req.includes("brak") || req.includes("masa ciała") || req.includes("maty") || req.includes("własne ciało")) continue;
    
    // check if req exists in dozwolone
    const match = dozwolone.find(k => req.includes(k) || k.includes(req));
    if (!match) return false;
  }
  return true;
});

const withHantle = validDlaAstorii.filter(ex => {
  if (!ex.wymagany_sprzet) return false;
  const rawReqs = Array.isArray(ex.wymagany_sprzet) ? ex.wymagany_sprzet : [ex.wymagany_sprzet];
  const reqs = rawReqs.flatMap(r => String(r).split(",").map(s => s.trim().toLowerCase()));
  return reqs.some(req => req.includes("hantle"));
});

console.log("Łącznie ćwiczeń dostępnych dla sprzętu Astorii:", validDlaAstorii.length);
console.log("W tym ćwiczeń używających hantli:", withHantle.length);
withHantle.forEach(ex => console.log("- " + ex.id_cwiczenia + ": " + ex.nazwa + " (" + ex.wymagany_sprzet + ")"));
