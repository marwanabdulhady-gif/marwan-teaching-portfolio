# Marwan Abdulhady — Teaching & Learning-Experience Design Portfolio

A bilingual (English / Arabic) portfolio for Marwan's mathematics teaching and
learning-experience design work. It is separate from the corporate training
portfolio (https://marwan-abdulhady.vercel.app) and links back to it.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build in dist/
npm run lint     # type check
```

Deploy on Vercel: **Add New → Project → import this repo**. Vercel detects
Vite; no settings or environment variables are needed.

## Sections

| Section | File |
| --- | --- |
| Navigation + mobile menu | `src/components/TeachNav.tsx` |
| Hero (chalkboard) | `src/components/TeachHero.tsx` |
| Credentials marquee | `src/components/CredentialsBar.tsx` |
| About | `src/components/TeachAbout.tsx` |
| Learning-experience designs | `src/components/LearningDesigns.tsx` |
| Resource library | `src/components/ResourceLibrary.tsx` |
| Interactive math lab | `src/components/MathLab.tsx` |
| Classroom gallery | `src/components/ClassroomGallery.tsx` |
| Work with me (schools / parents & students) | `src/components/WorkWithMe.tsx` |
| Footer | `src/components/TeachFooter.tsx` |

## Editing content

**All copy lives in `src/teachingData.ts`**, bilingual (`{ en, ar }`), so both
languages are edited in one place. Outbound links (LinkedIn, email, Calendly,
WhatsApp, the corporate site, the resource library) are in the `LINKS` object
at the top of that file.

To add a design, add an entry to `DESIGNS` and drop its screenshots
(`.webp`, 16:10 for desktop, 390×844 for phone) into `public/designs/`.

## Look

Warm paper with navy ink, a coral voice and a sky-blue second voice; the hero,
art tiles, gallery cards and footer are dark navy "chalkboards" with coral and
sunflower chalk. Colours are tokens in `src/index.css`: any element with
`data-theme="dark"` becomes a chalkboard.
