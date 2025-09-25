export type FunFact = { label: string; text: string };

export const FUN_FACTS: FunFact[] = [
  { label: 'Botany', text: "Bananas are berries, but strawberries aren't!" },
  { label: 'Nutrition', text: 'The average banana contains about 105 calories.' },
  { label: 'Agriculture', text: 'A single banana tree can produce up to 240 bananas per year.' },
  { label: 'Agriculture', text: 'A banana plantation can produce fruit for up to 100 years.' },
  { label: 'Global Stats', text: "Bananas are the world's most popular fruit with over 100 billion consumed annually." },
  { label: 'Science', text: 'Bananas are naturally radioactive due to their potassium content (K-40).' },
  { label: 'History', text: 'Bananas were first domesticated in Southeast Asia over 7,000 years ago.' },
  { label: 'Culinary', text: 'Banana bread surged in popularity during the 1930s Great Depression.' },
  { label: 'Colors', text: 'Wild bananas can be red, purple, or green—not just yellow.' },
  { label: 'Transport', text: 'Bananas are picked green and ripen during shipment.' },
  { label: 'Chemistry', text: 'Bananas ripen faster near other fruit due to ethylene gas.' },
  { label: 'Health', text: 'Bananas are rich in vitamin B6, vitamin C, and fiber.' },
  { label: 'Botany', text: 'The banana “tree” is actually a giant herb; its stem is a pseudostem.' },
  { label: 'Measure', text: 'The average banana is about 18 cm (7 inches) long—our unit of measure!' },
  { label: 'Space', text: 'Astronauts have eaten bananas on space missions for easy potassium.' },
  { label: 'Language', text: '“Bananas” as slang for “crazy” dates back to the 1960s.' },
  { label: 'Trade', text: 'Bananas are a top exported fruit for countries like Ecuador and the Philippines.' },
  { label: 'Plant Care', text: 'Each banana plant fruits once; new fruit comes from its offshoots (suckers).' },
];

export function pickRandomFacts(n = 6, facts: FunFact[] = FUN_FACTS): FunFact[] {
  const pool = [...facts];
  const out: FunFact[] = [];
  while (out.length < n && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}
