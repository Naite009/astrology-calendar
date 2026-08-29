import fs from "node:fs";
import { computeFamilySynastry, buildPairReadingPayload } from "@/lib/parentChildSynastry";
import { generateParentHandout, buildHandoutContent } from "@/lib/parentHandoutPdf";
import type { NatalChart } from "@/hooks/useNatalChart";

const charts = JSON.parse(fs.readFileSync("/tmp/charts.json", "utf8")) as {
  chart_name: string;
  chart_data: NatalChart;
}[];
const get = (n: string) => charts.find((c) => c.chart_name === n)!.chart_data;

const URL = process.env.SUPABASE_URL!;
const KEY = process.env.SUPABASE_ANON_KEY!;

async function run(parent: string, child: string) {
  const p = get(parent);
  const c = get(child);
  const report = computeFamilySynastry(p, c, "parent", "child");
  const payload = buildPairReadingPayload(p, c, "parent", "child", report);
  const res = await fetch(`${URL}/functions/v1/family-pair-reading`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, apikey: KEY },
    body: JSON.stringify(payload),
  });
  const reading = await res.json();
  fs.writeFileSync(`/tmp/qa-${child.replace(/\s/g, "")}.json`, JSON.stringify(reading, null, 2));

  const allSub2 = report.rows
    .filter((r: any) => r.orb < 2)
    .map((r: any) => `${r.fromPlanet} ${r.aspect} ${r.toPlanet} ${r.orb.toFixed(2)}° ${r.tone ?? ""}`);
  console.log(`\n=== ${parent} -> ${child} ===`);
  console.log("sub-2° contacts:", allSub2);
  console.log("aspectsUsed", reading.aspectsUsed, "traceableCount", reading.traceableCount);
  console.log("trace:", (reading.traceableAspects ?? []).map((t: any) => `${t.label} ${t.orb}° ${t.tone}`));
  console.log("wider:", (reading.widerContacts ?? []).map((t: any) => t.label ?? t));
  console.log("needs?", !!reading.whatThisChildNeedsFromYou, "learning?", !!reading.bothAreLearning, "resp?", !!reading.responsibilities);
  console.log("validation:", reading._validation_log);
  console.log("keyMessage:", reading.keyMessage);
  console.log("rhythms:", reading.rhythms);

  const content = buildHandoutContent({ reading, parentName: parent, childName: child });
  console.log("handout content:", JSON.stringify(content, null, 2));
  const doc = generateParentHandout({ reading, parentName: parent, childName: child });
  const out = `/tmp/handout-${child.replace(/\s/g, "")}.pdf`;
  fs.writeFileSync(out, Buffer.from(doc.output("arraybuffer")));
  console.log("pages:", doc.getNumberOfPages(), "->", out);

  const text = JSON.stringify(reading);
  const bad = ["behaviour", "favour", "practising", "colour", "centre", "cannot speak", "literally cannot", "\u2014"].filter((b) =>
    text.toLowerCase().includes(b.toLowerCase()),
  );
  console.log("banned hits:", bad);
}

await run("Lauren Newman", "Ben Levin");
await run("Lauren Newman", "Ike Levin");
