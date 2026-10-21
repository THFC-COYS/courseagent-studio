# CourseAgent Studio

**Every professor is about to get an agent. Most of them will ship an ungoverned one. This studio exists so they ship a chartered one instead.**

CourseAgent Studio is a working, single-page studio that turns a course syllabus into a governed course agent. Paste in a syllabus, configure the agent's persona and guardrails, read the agent charter the studio generates from your choices, then test the agent live in a simulated student chat. The agent answers only from the syllabus, gives hints instead of homework answers, blocks answer-key requests outright, and refuses off-syllabus questions with an escalation to a human. When it passes your checks, export the charter and publish the agent with its governance attached, on Muse Exchange or any agent platform.

Built by Greg Lucas, a Muse early adopter and advocate. Design law for this project, and for every project in this portfolio: agents first, Muse first. The studio designs agents for Muse and any agent platform, with Muse Exchange as the publish destination, because a governed agent should be portable and its charter should travel with it.

Companion projects: [Muse Exchange](https://muse-exchange.vercel.app) (the marketplace for Muse agents), [MuSe SIM](https://muse-sim.vercel.app) (a society of Muse agents), [Business Agent Readiness](https://github.com/THFC-COYS/business-agent-readiness) (the AGENT Framework assessment for businesses adopting agents), and [agentlint](https://github.com/THFC-COYS/agentlint) (the governance linter for AI agents).

## Why this exists

The AI-in-education race is here: Google is building aiEDU and AI for Classroom, Microsoft is pushing Copilot into education, and Meta is taking agents into learning at scale. The tools will reach professors long before the governance does. A course agent with no charter can hand out answer keys, invent policies, message students unsupervised, and teach material that was never in the course, and nobody will know until a grade dispute lands.

CourseAgent Studio treats the charter as the product. The chat is the demo. The governance is the point.

## How it works

No build step, no dependencies, no server. One file: open `index.html` in any modern browser, or serve the folder with any static host.

**Step 1: Syllabus.** Enter the course name, the topics (one per line, as `Title: details`), and the course policies. The details you write are the agent's only source material. A built-in sample syllabus (BIO 210: Human Systems, a fictional course at the fictional Northgate College) loads in one click so you can test the studio immediately.

**Step 2: Configure and charter.** Name the agent, name its owner (the accountable human; the studio will not proceed without one), pick a persona (Socratic tutor, teaching assistant, or study coach), and set the guardrails:

- **Hint-only mode.** Homework-style questions get Socratic hints, never worked answers. This follows the Bastani et al. research on AI tutors, which found that students with access to answer-giving AI can perform worse on later unaided work.
- **No-answer-key rule.** Requests for answer keys or test answers are blocked outright, even if hint-only mode is off.
- **Citation requirement.** Every content answer names the syllabus section it came from.

As you configure, the studio generates the **agent charter** live, structured on the AGENT Framework with Governance first: owner, allowed actions, approval gates (never grades, never messages students outside the channel, never changes course records), a kill switch the owner can pull instantly, a data rule, the in-scope topic list, weekly evaluation duties, the escalation path, and a transformation loop that feeds student questions back into the next syllabus revision.

**Step 3: Studio and publish.** Chat with the agent as a student would. Behavior labels show what the agent decided: `answer` (matched to a syllabus topic, cited), `hint` (homework-style question redirected to guided reasoning), `blocked` (answer-key request refused by charter rule), or `refusal` (off-syllabus, answered with the escalation path). The charter panel sits beside the chat so the contract and the behavior are visible at the same time. The publish checklist then walks the launch: charter approved by the owner, kill switch tested, refusal and hint behavior tested, configuration scored with agentlint, charter exported and attached to the listing on Muse Exchange.

## How the simulation works, honestly

This demo runs entirely in the browser with no model and no network calls. The simulated agent classifies each question with simple, inspectable logic: keyword and topic matching against the syllabus corpus you provided, pattern checks for answer-key and homework-style requests, and the guardrail configuration you set. That is deliberate. If a demo agent this simple needs a charter, an owner, approval gates, and a kill switch, then a production agent built on a frontier model needs them even more. The governance layer is the technology this project is actually demonstrating.

The core logic lives in one script block in `index.html` (`id="agent-core"`), written as pure functions with no DOM access, so it can be lifted out and unit tested in Node, or replaced with a real model call behind the same charter.

## The governance thread

CourseAgent Studio is the higher-education expression of a body of work on safe agentic AI:

- The **AGENT Framework** (Acumen, Governance, Evaluation, Navigation, Transformation) structures every charter the studio writes.
- **agentlint** scores agent configurations for governance risk before launch, and appears in the publish checklist for that reason.
- The **Safe Agents** doctrine (least privilege, approval gates, kill switches, attestation, agent census) is the checklist behind the charter.
- **AIccountable** takes the same sequence (Identify, Train, Design, Implement, Prove) into companies adopting agents.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole studio: interface, charter generator, and the simulated syllabus-bound agent |
| `README.md` | This file |
| `LICENSE` | MIT license |

## Author

Greg Lucas, Founder of pAIgeBreaker (personalized learning, with Aithentik authorship verification) and AIccountable (agent adoption and governance for business). Faculty Chair at Grand Canyon University, where he authored AI degree programs and responsible-AI guidelines; Team Lead at Southern New Hampshire University. He writes and speaks on safe agentic AI and builds in public on Muse.

- Portfolio: [paigebreaker.com](https://paigebreaker.com)
- LinkedIn: [linkedin.com/in/greg-lucas-28765b416](https://www.linkedin.com/in/greg-lucas-28765b416/)
- Muse Exchange: [muse-exchange.vercel.app](https://muse-exchange.vercel.app)
- MuSe SIM: [muse-sim.vercel.app](https://muse-sim.vercel.app)
