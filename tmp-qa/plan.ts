import { readFileSync } from "node:fs";
import { buildHandoutContent, generateParentHandout } from "../src/lib/parentHandoutPdf";
const reading = JSON.parse(readFileSync("/tmp/qa-HannahGreenstein.json","utf8"));
const c = buildHandoutContent({ reading, parentName: "Erica Broder", childName: "Hannah Greenstein" });
console.log(JSON.stringify({ lang: c.emotionalLanguage.length, plang: c.parentEmotionalLanguage.length, dyn: c.dynamic }, null, 1));
generateParentHandout({ reading, parentName: "Erica Broder", childName: "Hannah Greenstein" });
