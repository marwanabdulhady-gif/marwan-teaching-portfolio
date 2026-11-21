# Mowazi Drive review and import status

**Reviewed:** 2026-11-17
**Drive root:** [Mowazi](https://drive.google.com/drive/folders/1BSQkT99nOw8G-tBB2u83tGwxjuVJwGBS)
**Repository branch:** `arena/b95dc6e9-mathslab`

## Scope and status

The requested scope is the **entire Drive tree**, including nested current and historical resources. The root and several high-level folders have been inventoried, and the supplied Fikr HTML template, README, design guide, and all 13 grade briefs are in this repository. This is **not a complete Drive import or content review**: the Drive connector exposes file-by-file listing/read operations, but no operation that exports a folder tree or writes Drive contents directly into the repository. Some connector results are truncated. No source files from the Drive tree have yet been faithfully mirrored here. The existing `google_drive/fikr-lesson-games.zip` is a separate Fikr kit asset and is not the Mowazi Drive export.

The user selected full recursive scope. The inventory below is evidence of the scale and current discovery progress, not a claim that all descendants or contents were read. To finish a faithful full import, provide/export the full Drive tree as an archive (or equivalent files) into the workspace; then its files can be preserved and audited locally without silently omitting pages, tabs, or large content.

## Root inventory (16 direct children)

The Drive API returned 16 direct children for the root:

| Drive item | ID | Inventory/review state |
|---|---|---|
| `01 — لوحة القيادة والمراجع الاستراتيجية` | `1-K3FRPkBAL_1e21Z1B0AeajAAO3Hr5Zd` | Listed: 10 direct files, mostly strategic research, assessment, references, tracking, and audit documents. Contents not yet fully mirrored. |
| `02 — المنهج — السنوات 1 إلى 9` | `1-AtWFBRBwFLCoVmPrJEyub-fZB-Pjj5L` | Listed: 11 children—9 grade folders and 2 evidence files. Grade 1 folder lists 79 items (its listing was truncated); the G2–G9 audit describes 192 lesson/capstone documents. Descendants not completely inventoried/read. |
| `03 — الألعاب والمحطات` | `1Xi2L1nM7pmhkfQUulC9ykGxx6QQ6Kmf6` | Listed: a game folder and a games/stations tracking sheet. Nested game files not yet listed. |
| `04 — مكتبة الهوية البصرية والدروس النموذجية` | `1PFrQzaqdSCcG8aZB3bfWgGD5ySkv1G-X` | Listed: visual-curriculum library folder and `sample lesson.html` (1,284,128 bytes). The library descendants have not yet been inventoried. |
| `05 — الهوية والتجربة المرجعية (نبع)` | `17NNHE7viESb4WSoaP78scl3IdSzIKsPx` | Listed: one Nab‘ prototype HTML (1,288,639 bytes); not copied. |
| `06 — سجل التحديثات والأرشيف` | `1otyEC57ESby5SSDMP6jGuAyD8noA_9K5` | Listed: one updates-log Google Doc. |
| `education_resources.html` (563-resource library; marked **OLD / superseded 2026-11-15**) | `1kry9O1VBaufsZvL5XC4XvrI6z_5fIeQI` | Listed; 1,755,619 bytes. Included in requested full scope, though its superseded status should remain explicit. |
| `islamic_integration_providers.csv` | `1QgSd5tjyEQE8zH8lYbfgtCSahBVM7btX` | Listed; 18,009 bytes. Contents not yet mirrored. |
| `Master Sheet — أفكار المشاريع الجديدة والاستثمارات والدخل السلبي` | `1q4MO6Dnj2oMDsJOaLxnYrLnV1f12MxUi5XUJS5jY1cY` | Listed Google Sheet; 163,401 bytes. Contents/tabs not read. |
| `nab_curriculum_map.csv` | `1uAZs3YHVzF1hcaSESL4aaGXAZq3gCWtF` | Read as CSV (19,964 bytes). It is a grade-by-subject/Drive-folder map; the export showed 55% inventory completion for G1, 100% for G2, and 5% for G3–G9. These are source-sheet values, not independent verification. |
| `أفكار مشاريع جديدة وطرق استثمار مناسبة (الدخل السلبي)` | `1QYh55VvE2Qy89qVPf_FV2sdOU92Yn_Z1bRlGKZWyhng` | Listed Google Doc; 167,837 bytes. Contents not read. |
| `اراجيز ومنظومات` | `1x0LDRsz4X_wAvsrMRuTrMABNpDgjHJx-` | Listed: 4 Markdown drafts; descendants/content not imported. |
| `تدبر وعمل` | `1ROYDemsfbEGd2hxRoLIVAoZ9wttM13Nd` | Listed: 341 files (HTML, JSON, and related resources); result too large to display in full. The files have not been read or copied. |
| `موازي — أفكار البحث والتطوير المستمرة (R&D)` | `1geAv0s9SXnoHCsnVrJYQpHtPntBNDMfNtmykf18ogng` | Text read through Drive export, but the 120,000-character response was truncated; file metadata reports 227,598 bytes. Not faithfully mirrored. |
| `موازي — لوحة تتبع تطوير المناهج (Curriculum Tracker) 2026-11-07` | `1sPr77fz4aGK0xB61Q6CjMRLy7dh5bfeklMtmcfyqWn8` | Read as first-sheet CSV only; other tabs were not exported. Its visible metrics describe 1,159 total indexed/planned items, 794 not produced, 347 drafts needing review, and 0 explicitly confirmed/approved. Treat these as tracker claims, not verified status. |
| `نبع — الفهرس المنهجي للصفوف التسعة — 2026-11-03` | `1hHJOpIVGQMcnpDOOQnINxNknDs2pVzji3I41ofKPYug` | Listed Google Sheet; 61,772 bytes. Contents/tabs not read. |

## Specific content actually read from Drive

- **Curriculum tracker (first sheet only):** its CSV states 1,159 indexed/planned lessons and material sets; it flags 794 as not produced, 347 drafts as needing review, and zero as explicitly confirmed/approved. The source also notes 49 cases where the tracker is ahead of the lesson index. This is a dated operational spreadsheet, not a classroom evaluation.
- **G2–G9 audit report** (`1c_l25b7X_55p7qlgz1-kCUWt82m_-G92`): read its text. It reports automated structural/content checks on 192 items (160 lessons + 32 capstones) and 192 verse references, with no automated findings. Crucially, it says the audit was structural/content-automated, not educational/classroom testing; the documents remain status P2, and had not been tried in a classroom. It also says hadith religious review was not completed and scientific/mathematical alignment to national textbooks was not completed. Preserve these limitations whenever summarizing its result.
- **Nab‘ curriculum map CSV** (`1uAZs3YHVzF1hcaSESL4aaGXAZq3gCWtF`): read. It includes grade/subject rows and folder links, but is not itself evidence that listed folders or curriculum were fully reviewed.
- **R&D baseline** (`1geAv0s9SXnoHCsnVrJYQpHtPntBNDMfNtmykf18ogng`): began reading; Drive export explicitly reported truncation at 120,000 characters. No full-content claim is made.

## Template and brief-kit review

The template and brief kit are included in `games/templates/fikr-lesson-game-template.html` and `docs/mowazi/game-briefs/`.

- The template is a 63,977-byte, self-contained HTML lesson game with no external script, stylesheet, font, image, or network URLs. The two active inline JavaScript blocks pass `node --check`; HTMLParser accepts the document. Its documented host contract emits `lesson:ready`, `lesson:progress`, `lesson:level`, `lesson:mistakes`, and `lesson:done`.
- All 13 grade briefs have the common ten content sections, with age/band-oriented worked examples and completion markers. Their README is an index/guide; the examples are design guidance, not approved Mowazi scope.
- **Consistency correction made during this review:** the guide's accessibility section requires targets of at least 44 px (64 px for K–2), while the 9–12 brief/template band used 40 px and the template's header/coach controls were hard-coded at 40/44 px. The 9–12 target is now 44 px, and header/coach buttons now follow the selected band target. K–2 remains 72 px; 3–5 remains 56 px; 6–8 remains 44 px.
- The grade briefs cover K–12 and broad multi-subject ideas; the Mowazi grade map is K–9 and the audited curriculum scope is G2–G9. Before building, align each proposed lesson against the actual Mowazi lesson/source IDs. The brief kit alone does not establish Mowazi curriculum approval or classroom efficacy.

## Still outstanding

1. Obtain the actual full Drive export or complete subtree access into the workspace.
2. Recursively inventory all descendants, preserve native-format exports and binary assets, and index provenance (Drive ID, title, MIME type, parent, date, source link).
3. Read/copy the current and historical material without treating the superseded 563-resource file as current; include it in the historical archive if full scope remains intended.
4. Reconcile file counts and status conflicts across the source index, tracker, audit, and grade folders.
5. Keep curriculum alignment, automated source checks, religious review, classroom testing, and approval as separate evidence claims.
