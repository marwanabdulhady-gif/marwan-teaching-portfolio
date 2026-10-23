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
| Lessons & resources (YouTube, worksheets, TPT store) | `src/components/ResourceLibrary.tsx` |
| FIKR Math Arcade | `src/components/MathLab.tsx` + `public/arcade/` |
| Live rooms (Math Fighter, Tug of War) | `src/components/LiveRooms.tsx` + `src/rooms/` |
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

**Lessons & resources.** Put your worksheets link (for example a shared
Google Drive folder) in `LINKS.worksheets` and your Teachers Pay Teachers
store in `LINKS.tpt`; until then each card shows "Coming soon". To feature
YouTube lessons, add them to `VIDEOS` with the 11-character id from
`youtube.com/watch?v=…`, a title and a topic.

**FIKR Math Arcade.** `public/arcade/index.html` is the self-contained build
of the MathPlay hub from the FIKR dashboard repo (`playhub/index.html`), with
one small style block added that hides the lesson-game links. Only the general
games ship here: the lesson games and the dashboard (and its pupil data) are
not part of this repository. To update it, copy the new `playhub/index.html`
over and keep that style block. Framed, the hub wears the FIKR look, whose heading
face is served from `public/vendor/fonts/`.

**Live rooms.** Two players on two devices play the real Math Fighter or Tug of War:
one makes a room and shares the 4-letter code (or the invite link, `?room=CODE#lab`),
the other joins. It is the FIKR games page's Live challenge protocol
(`src/rooms/liveRoom.ts`) over Supabase Realtime — presence and broadcast on
`mtp-room-…` channels only, nothing stored. By default it uses the FIKR project's
public URL and publishable key; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
to use another project. Add `?rooms=local` to the page URL to play between two tabs of
one browser with no internet (that is how the rooms are tested). A visitor on their own
can play the hub's robot (Rookie, Racer, Master).

## Look

Warm paper with navy ink, a coral voice and a sky-blue second voice; the hero,
art tiles, gallery cards and footer are dark navy "chalkboards" with coral and
sunflower chalk. Colours are tokens in `src/index.css`: any element with
`data-theme="dark"` becomes a chalkboard.
