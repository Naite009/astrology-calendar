import { readFileSync, writeFileSync } from "node:fs";
import { computeFamilySynastry, buildPairReadingPayload } from "../src/lib/parentChildSynastry";
import { generateParentHandout, buildHandoutContent } from "../src/lib/parentHandoutPdf";

const URL = process.env.SB_URL!;
const KEY = process.env.SB_KEY!;
const charts = JSON.parse(readFileSync("/tmp/charts.json", "utf8")) as Record<string, any>;

async function run(parent: string, child: string) {
  const p = charts[parent], c = charts[child];
  if (!p || !c) throw new Error(`missing chart ${parent}/${child}`);
  const report = computeFamilySynastry(p, c, "parent", "child");
  const payload = buildPairReadingPayload(p, c, "parent", "child", report);
  const res = await fetch(`${URL}/functions/v1/family-pair-reading`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, apikey: KEY },
    body: JSON.stringify(payload),
  });
  const reading = await res.json();
  writeFileSync(`/tmp/qa-${child.replace(/\s/g, "")}.json`, JSON.stringify(reading, null, 2));
  const parentName = p.name ?? parent, childName = c.name ?? child;
  const content = buildHandoutContent({ reading, parentName, childName });
  const doc = generateParentHandout({ reading, parentName, childName });
  const pages = (doc as any).getNumberOfPages();
  const out = `/tmp/handout-${child.replace(/\s/g, "")}.pdf`;
  writeFileSync(out, Buffer.from(doc.output("arraybuffer")));
  console.log(`\n=== ${parentName} -> ${childName} ===`);
  console.log("pages:", pages, "| pdf:", out);
  console.log("tight contacts:", (reading.traceableAspects ?? []).map((t: any) => `${t.label} ${t.orb.toFixed(2)}° ${t.tone}`));
  console.log("rhythms:", content.parentRhythm, "||", content.childRhythm);
  console.log("child lang:", content.emotionalLanguage);
  console.log("parent lang:", content.parentEmotionalLanguage);
  console.log("dynamic:", content.dynamic);
  console.log("sources:", content.sourceLabels);
  console.log("needs:", content.needs);
  console.log("learning:", content.learning);
  console.log("harder:", content.harder);
  console.log("helps:", content.whenHard);
  console.log("parent resp:", content.yours);
  console.log("child resp:", content.notYours);
  console.log("key:", content.keyMessage);
  const all = JSON.stringify(content);
  const bad = [/\u2014/, /\bbehaviour\b/i, /\balways will\b/i, /\bdiagnos/i].filter((r) => r.test(all));
  console.log("language flags:", bad.map(String));
}

const pairs = process.argv.slice(2);
for (let i = 0; i < pairs.length; i += 2) await run(pairs[i], pairs[i + 1]);
