import fs from "node:fs";
import { generateParentHandout, buildHandoutContent } from "@/lib/parentHandoutPdf";
for (const [child, file] of [["Ben Levin","/tmp/qa-BenLevin.json"],["Ike Levin","/tmp/qa-IkeLevin.json"]] as const) {
  const reading = JSON.parse(fs.readFileSync(file,"utf8"));
  const input = { reading, parentName: "Lauren Newman", childName: child };
  console.log(child, "| emotional:", buildHandoutContent(input).emotionalLanguage);
  const doc = generateParentHandout(input);
  fs.writeFileSync(`/tmp/handout-${child.replace(/\s/g,"")}.pdf`, Buffer.from(doc.output("arraybuffer")));
  console.log("pages", doc.getNumberOfPages());
}
