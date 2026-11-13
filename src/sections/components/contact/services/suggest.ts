/**
 * Lightweight Roman-Urdu + English writing assistant (local, dictionary based).
 * - Never changes the textarea by itself: it only RETURNS a suggestion.
 * - Only Latin-script words are touched; Urdu / Hindi / emoji text is passed through unchanged.
 */

// misspelling / variant → preferred spelling (all lowercase keys)
const DICT: Record<string, string> = {
  // Roman Urdu
  apka: "aapka", apki: "aapki", apke: "aapke", ap: "aap", aapka: "aapka",
  bohot: "bohat", boht: "bohat", bohut: "bohat", bhot: "bohat",
  acha: "acha", achaa: "acha", accha: "acha", achha: "acha", acchi: "achi", achii: "achi",
  ha: "hai", hy: "hai", hay: "hai", hain: "hain", hen: "hain",
  zabardast: "zabardast", zabrdast: "zabardast", zabardst: "zabardast", zabrdst: "zabardast",
  shukriya: "shukriya", shukria: "shukriya", shukriyaa: "shukriya", sukria: "shukriya",
  kamal: "kamaal", kmaal: "kamaal",
  pasand: "pasand", psand: "pasand", psnd: "pasand",
  mashallah: "MashaAllah", mashaallah: "MashaAllah", mashalla: "MashaAllah",
  khubsurat: "khoobsurat", khobsurat: "khoobsurat", khoobsoorat: "khoobsurat",
  waisay: "waise", waisa: "waisa", mje: "mujhe", mujy: "mujhe", mjhe: "mujhe",
  bht: "bohat", kyaa: "kya", nhi: "nahi", nahin: "nahi",
  bhai: "bhai", bhaii: "bhai", yar: "yaar", yaaar: "yaar", wahh: "wah", waah: "wah",
  tarqi: "taraqi", taraki: "taraqi", trqi: "taraqi", mehnat: "mehnat", mehant: "mehnat",
  lajawab: "lajawab", lajwab: "lajawab", behtareen: "behtareen", behtrin: "behtareen",
  website: "website", webiste: "website", wesite: "website", websit: "website", webste: "website",
  portfoliyo: "portfolio", portfolo: "portfolio", portfoilo: "portfolio", portofolio: "portfolio", portfollio: "portfolio",
  desing: "design", dizain: "design", dizayn: "design",
  // English
  teh: "the", adn: "and", recieve: "receive", definately: "definitely", seperate: "separate",
  awsome: "awesome", awesom: "awesome", amazin: "amazing", amazng: "amazing", beutiful: "beautiful", beatiful: "beautiful",
  gud: "good", gr8: "great", grate: "great", nyc: "nice", nic: "nice", thx: "thanks", thanx: "thanks", thnks: "thanks",
  profesional: "professional", proffesional: "professional", wrk: "work", wokr: "work", keepitup: "keep it up",
  lov: "love", luv: "love", realy: "really", relly: "really", exelent: "excellent", excelent: "excellent",
  developper: "developer", devloper: "developer", experiance: "experience", responsve: "responsive",
};

// Words that are valid as-is and must never be "fixed" even if the dictionary has a loose entry.
const KEEP = new Set(["he", "ho", "hi", "me", "so", "do", "go", "no", "ok", "is", "in", "it", "on"]);

const LATIN_WORD = /^([^\p{L}']*)([A-Za-z']+)([^\p{L}']*)$/u;

/** Returns the corrected string (may equal input). Pure + synchronous. */
export function correct(text: string): string {
  const parts = text.split(/(\s+)/); // keep original whitespace
  let firstWord = true;
  const out = parts.map((tok) => {
    if (!tok.trim()) return tok;
    const m = LATIN_WORD.exec(tok);
    let res = tok;
    if (m) {
      const [, pre, word, post] = m;
      const lower = word.toLowerCase();
      if (!KEEP.has(lower) && Object.prototype.hasOwnProperty.call(DICT, lower)) {
        const fixed = DICT[lower];
        // Already-correct word (e.g. "Acha") keeps the visitor's own capitalisation.
        res = pre + (fixed === lower ? word : fixed) + post;
      }
    }
    if (firstWord && /^[a-z]/.test(res.replace(/^[^\p{L}]*/u, ""))) {
      res = res.replace(/\p{L}/u, (c) => c.toUpperCase());
    }
    firstWord = false;
    return res;
  });
  return out.join("");
}
