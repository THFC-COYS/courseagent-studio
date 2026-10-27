/* Node harness for CourseAgent Studio.
   Extracts the pure <script id="agent-core"> block from index.html and
   asserts its behavior. Run: node tests/harness.js
   Sections: BASELINE pins the behavior that shipped with the studio.
   SOUL pins the soul step mirror and must never weaken the baseline. */
"use strict";
var fs = require("fs"), os = require("os"), path = require("path");

var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var m = html.match(/<script id="agent-core">([\s\S]*?)<\/script>/);
if (!m) { console.error("agent-core block not found"); process.exit(1); }
var tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cas-")), "core.js");
fs.writeFileSync(tmp, m[1]);
var C = require(tmp);

var passed = 0, failed = 0, failures = [];
function check(name, cond) {
  if (cond) { passed++; }
  else { failed++; failures.push(name); console.log("FAIL: " + name); }
}
function includes(name, hay, needle) { check(name, typeof hay === "string" && hay.indexOf(needle) >= 0); }

/* ---------- shared fixture (the sample syllabus) ---------- */
var TOPICS = [
  "The nervous system: Neurons transmit electrical signals across synapses using neurotransmitters. The brain and spinal cord form the central nervous system.",
  "Metabolism and enzymes: Enzymes are proteins that speed up chemical reactions by lowering activation energy. Metabolism is the sum of building and breaking reactions in the body."
].join("\n");
var POLICIES = "Late work loses 10 percent per day. Office hours are Tuesday and Thursday, 2 to 4 pm.";
var CORPUS = C.parseCorpus(TOPICS, POLICIES);

var CFG = {
  courseName: "BIO 210: Human Systems", agentName: "BioBuddy", ownerName: "Professor Dana Whitfield",
  persona: "socratic", hintOnly: true, noAnswerKey: true, requireCitation: true,
  escalation: "Please ask your professor during office hours.", corpus: CORPUS
};

/* ================= BASELINE (25) ================= */
/* word normalization */
check("B01 normalize ies to y", C.normalizeWord("bodies") === "body");
check("B02 normalize strips ing", C.normalizeWord("running") === "runn");
check("B03 normalize keeps double s", C.normalizeWord("class") === "class");
check("B04 normalize lowercases and strips plural s", C.normalizeWord("Neurons") === "neuron");
check("B05 contentWords drops stopwords and keeps content", C.contentWords("What is the nervous system?").indexOf("what") === -1 && C.contentWords("What is the nervous system?").indexOf("system") >= 0);
check("B06 contentWords dedupes", C.contentWords("heart heart heart").length === 1);

/* corpus parsing */
check("B07 corpus holds topics plus one policy entry", CORPUS.length === 3);
check("B08 topic title parsed", CORPUS[0].title === "The nervous system");
includes("B09 topic detail parsed", CORPUS[0].detail, "Neurons transmit electrical signals");
check("B10 policy entry kind", CORPUS[2].kind === "policy");
check("B11 line without colon yields empty detail", C.parseCorpus("Just a title", "")[0].detail === "");

/* matching */
check("B12 matchCorpus finds the nervous topic", C.matchCorpus("How do neurons send signals?", CORPUS).entry.title === "The nervous system");
check("B13 matchCorpus no match gives null entry", C.matchCorpus("zebra quantum xylophone", CORPUS).entry === null);

/* classification */
check("B14 answer key request is blocked when the rule is on", C.classifyQuestion("Can you share the answer key for the midterm?", CFG).type === "blocked");
check("B15 answer key request is a refusal when the rule is off", C.classifyQuestion("Can you share the answer key for the midterm?", Object.assign({}, CFG, { noAnswerKey: false })).type === "refusal");
check("B16 homework question gets a hint in hint-only mode", C.classifyQuestion("Give me the answer to question 3 on the homework about metabolism", CFG).type === "hint");
check("B17 homework question is answered from the topic when hint-only is off", C.classifyQuestion("Give me the answer to question 3 on the homework about metabolism", Object.assign({}, CFG, { hintOnly: false })).type === "answer");
check("B18 on-syllabus question is answered", C.classifyQuestion("How do neurons send signals to each other?", CFG).type === "answer");
includes("B19 answers cite the syllabus section", C.classifyQuestion("How do neurons send signals to each other?", CFG).message, "Source: your syllabus");
check("B20 off-syllabus question is refused", C.classifyQuestion("Who won the football game last night?", CFG).type === "refusal");
includes("B21 refusal carries the escalation", C.classifyQuestion("Who won the football game last night?", CFG).message, "Please ask your professor during office hours.");
includes("B22 coach persona answers with a study move", C.classifyQuestion("How do neurons send signals to each other?", Object.assign({}, CFG, { persona: "coach" })).message, "Study move");

/* charter */
var charter = C.buildCharter(CFG);
includes("B23 charter title and owner", charter, "COURSE AGENT CHARTER");
includes("B24 charter lists in-scope topics", charter, "The nervous system");
includes("B25 charter states the answer-key prohibition", charter, "Prohibited: providing answer keys");

/* ================= SOUL (13) ================= */
var SOUL_CFG = Object.assign({}, CFG, {
  agentName: "BioBuddy",
  identity: "You are BioBuddy, the BIO 210 tutor who never hands over an answer a student can reach themselves.",
  bearings: ["patient"],
  values: ["learning"],
  valuesText: "Worked examples come after the student's own attempt",
  neverDo: ["nograde"],
  neverDoText: "Never discuss one student's grades with another student.",
  voiceSample: "Tell me what you tried first, and we will go from there."
});
var GROUNDING = "The nervous system: Neurons transmit signals.\n\nCourse policies:\nLate work loses 10 percent per day.";
var soulPkg = C.buildMusePackage(SOUL_CFG, GROUNDING);
var soulSection = C.buildSoulSection(SOUL_CFG);

check("S01 blank name falls back to the persona default", C.resolveAgentName({ agentName: "", persona: "socratic" }) === "Sage");
includes("S02 default identity is composed from name, persona, and course", C.defaultIdentity({ agentName: "", persona: "ta", courseName: "BIO 210: Human Systems" }), "You are Scout, the teaching assistant for BIO 210: Human Systems");
includes("S03 soul section carries the custom identity", soulSection, "You are BioBuddy, the BIO 210 tutor who never hands over an answer a student can reach themselves.");
includes("S04 bearing chip reaches the section", soulSection, "Patient. Confusion gets a slower, clearer pass");
includes("S05 value chip reaches the package", soulPkg, "Learning over answers");
includes("S06 free-text value lands verbatim", soulPkg, "Worked examples come after the student's own attempt");
includes("S07 preset never-do reaches the package", soulPkg, "Never grade or estimate a student's grade");
includes("S08 free-text never-do lands verbatim", soulPkg, "Never discuss one student's grades with another student.");
includes("S09 edited sample line is what ships", soulPkg, "Tell me what you tried first, and we will go from there.");
check("S10 blank sample falls back to the generated line", C.resolveVoiceSample({ agentName: "BioBuddy", persona: "socratic", courseName: "BIO 210: Human Systems", voiceSample: "" }).indexOf("BioBuddy") >= 0);
var i1 = soulPkg.indexOf("SECTION 1: WHO YOUR AGENT IS"), i2 = soulPkg.indexOf("SECTION 2: WHAT YOUR AGENT DOES"), i3 = soulPkg.indexOf("SECTION 3: WHERE THE INSTRUCTOR STAYS IN CHARGE");
check("S11 three section headers appear in order", i1 >= 0 && i2 > i1 && i3 > i2);
includes("S12 syllabus grounding lands in section 2", soulPkg, "SYLLABUS GROUNDING (the agent's only source material)");
includes("S13 charter names the default when the name is blank", C.buildCharter(Object.assign({}, CFG, { agentName: "" })), "Agent: Sage");

console.log("TOTAL: " + (passed + failed) + " assertions, " + passed + " passed, " + failed + " failed");
if (failures.length) { console.log("Failures: " + failures.join("; ")); }
process.exit(failed ? 1 : 0);
