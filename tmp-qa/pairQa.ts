import { readFileSync, writeFileSync } from "node:fs";
import { computeFamilySynastry, buildPairReadingPayload } from "../src/lib/parentChildSynastry";

const URL = process.env.SB_URL!, KEY = process.env.SB_KEY!;
const charts = JSON.parse(readFileSync("/tmp/charts.json", "utf8")) as Record<string, any>;

const OVERCLAIM = [
  /\b(he|she|they|the child)\s+(is|are)\s+(anxious|depressed|traumatized|narcissistic|bipolar|adhd|autistic)\b/i,
  /\bwill (always|never)\b/i, /\bcannot (ever|love|feel)\b/i, /\bproves? that\b/i,
  /\bdiagnos/i, /\bdisorder\b/i, /\bhe (knows|feels|thinks) that\b/i,
  /\bshe (knows|feels|thinks) that\b/i, /\bdoes not love\b/i,
];

async function run(parent: string, child: string) {
  const p = charts[parent], c = charts[child];
  const report = computeFamilySynastry(p, c, "parent", "child");
  const payload = buildPairReadingPayload(p, c, "parent", "child", report);
  const res = await fetch(`${URL}/functions/v1/family-pair-reading`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, apikey: KEY },
    body: JSON.stringify(payload),
  });
  const r: any = await res.json();
  const file = `/tmp/pair-${child.replace(/\s/g, "")}.json`;
  writeFileSync(file, JSON.stringify(r, null, 2));
  const sections = r.sections ?? [];
  console.log(`\n=== ${parent} -> ${child} === (${file})`);
  console.log("aspectsUsed:", r.aspectsUsed, "| sections:", sections.length, "| ranked:", r.aspectsRanked, "| considered:", r.aspectsConsidered, "| traceable:", r.traceableCount);
  console.log("MATCH aspectsUsed==sections:", r.aspectsUsed === sections.length);
  console.log("section titles:", sections.map((s: any) => s.title ?? s.aspect ?? "?"));
  console.log("trace tones:", (r.traceableAspects ?? []).map((t: any) => `${t.tone} ${t.orb}° ${t.label}`));
  const soft = (r.traceableAspects ?? []).filter((t: any) => t.tone === "supportive").length;
  console.log("supportive rows:", soft);
  const wide = (r.traceableAspects ?? []).filter((t: any) => (t.orb ?? 0) >= 6);
  console.log("wide(>=6) trace rows:", wide.map((t: any) => `${t.orb}° ${t.label}`));
  console.log("needs:", r.whatThisChildNeedsFromYou ? (r.whatThisChildNeedsFromYou.lines ?? []).map((l: any) => l.text) : "NULL");
  console.log("mechanism conflict:", r.childMechanism?.theConflict);
  console.log("validation log:", r._validation_log ?? []);
  const text = JSON.stringify(r);
  console.log("overclaim hits:", OVERCLAIM.filter((re) => re.test(text)).map(String));
  console.log("wider contacts:", r.widerContacts?.length ?? 0);
}
const a = process.argv.slice(2);
for (let i = 0; i < a.length; i += 2) await run(a[i], a[i + 1]);
