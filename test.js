const ex = { wymagany_sprzet: "drążki" };
const inwentarz = { "steppery": 30, "hantle": 60, "sztangi 5kg": 30, "maty": 30 };
const participants = 10;
const ensureEquipment = (ex, currentRoom, participants) => {
  if (currentRoom.tryb_treningu !== "fbw_synchroniczny") return true;
  if (!ex.wymagany_sprzet || ex.wymagany_sprzet.length === 0) return true;
  const rawReqs = Array.isArray(ex.wymagany_sprzet) ? ex.wymagany_sprzet : [ex.wymagany_sprzet];
  const reqs = rawReqs.flatMap(r => String(r).split(",").map(s => s.trim()));
  for (const req of reqs) {
    const reqLower = req.toLowerCase();
    if (reqLower === "" || reqLower.includes("brak") || reqLower.includes("masa ciała") || reqLower.includes("maty") || reqLower.includes("własne ciało")) continue;
    
    const availableKey = Object.keys(currentRoom.inwentarz).find(k => reqLower.includes(k.toLowerCase()) || k.toLowerCase().includes(reqLower));
    
    if (!availableKey) { console.log("Failed on", reqLower, "not found in", Object.keys(currentRoom.inwentarz)); return false; }
    
    const gymHas = currentRoom.inwentarz[availableKey];
    const multiplier = Math.max((ex.mnoznik_sprzetu || 1), 1);
    const needed = participants * multiplier;
    
    if (gymHas < needed) return false;
  }
  return true;
};
const room = { tryb_treningu: "fbw_synchroniczny", inwentarz };
console.log("Result:", ensureEquipment(ex, room, participants));
