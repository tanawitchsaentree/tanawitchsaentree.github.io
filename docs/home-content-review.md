# Homepage content and navigation review

Updated 25 September 2026.

## Editorial decisions

The primary title is Senior Product Designer. The introduction names the domains,
current employer and kind of work. Implementation supports that role rather than
introducing a competing job title. Public copy uses standard capitalization,
complete sentences and named tasks instead of slogans.

The page order is:
1. Name, role, introduction, location and contact/profile links.
2. Selected work: Allianz, Invitrace, Profita and Stellareat.
3. Independent project: Manabi, with notes and a direct product link.
4. Writing & tools: supplementary material in a native disclosure.
5. Email and background-motion control.

Professional work is selected by relevance, not presented as a complete employment
history. Dates and roles are always visible. Descriptions do not change on hover.
The whole case-study entry is a normal link, supporting keyboard activation,
new tabs and copied URLs. The old work fold, token counter, slash-command tool
names, dismissible personal-project promotion and vague result slogans are removed.

Manabi notes distinguish the product, the designer's role, the matching decision,
and data-access work. Implementation details are optional. Technical counts,
comparisons with other designers and claims about having proved the ability to
ship were removed. The modal retains focus handling and Escape dismissal.

## Facts and links

- Role names and employment years were checked against the supplied resume.
- Allianz dates changed from 2024–2025 to 2025–present; Invitrace's older MDX date
  changed from 2023 to 2024–2025.
- More than 10 hospitals is a platform-scope statement from the resume, not a
  claim that the interactive portfolio demonstration serves those hospitals.
- Both Allianz and Invitrace links disclose that a password is needed. Access
  controls are unchanged; gate copy offers contact and a return to selected work.
- Back links target `/#work`. The standalone Invitrace iframe uses `_top` so a
  return does not open the portfolio inside the iframe.
- LinkedIn links on the homepage and gate/contact surfaces use the profile URL
  in the supplied resume.
- `public/tanawitch-saentree-resume.pdf` is placeholder text, not a valid PDF.
  The homepage does not advertise it, and the legacy contact component offers
  an email request instead. No older attachment was silently published as the
  latest resume.
- No user/adoption/revenue claims were added for Manabi.
- The Profita award is **Highly Commended**, not Winner. The organizer's report
  identifies LH Bank/Profita in that category on page 14:
  https://hs.meed.com/hubfs/MEED/MEED%20Events/Special%20Reports/RBI/RBI%20Special%20Report%202023-1.pdf#page=14
  The live case-study reflection links this source and distinguishes the 2020
  design contribution from the 2023 recognition. The reflection's unsupported
  under-five-minutes claim and an unsupported target-exceeded claim in old MDX
  were removed; neither was replaced with an invented result.

## Validation

The audit covers the homepage, Manabi notes, entry/back navigation, and the
specific cross-page facts above. It is not a claim that every sentence or metric
in every legacy case study has been independently verified.

Browser visual/interaction review remains pending: the browser security check
could not verify the admin-enforced policy, including for the already-open tab.
No alternate browser control was used to bypass that block.

Completed checks:
- TypeScript check: passed.
- Production build: passed, all 11 static pages generated.
- Lint: no errors; existing warnings in untouched PortalNav, Profita screen and
  Stellar screen remain.
- CSS parsing and `git diff --check`: passed.
- Parsed the exported HTML with Python's HTMLParser: one visible identity heading;
  all four case-study links rendered outside disclosures; all four destination
  files exist; both protected entries labeled; LinkedIn URL aligned; writing/tools
  disclosure closed by default; old slogans and broken resume link absent.
- Verified exported Profita award wording, Allianz date correction, and the
  standalone Invitrace return link.

These are source/build/static-output checks, not screenshots or browser interaction
results. Visual QA and runtime keyboard/modal tests remain pending.
