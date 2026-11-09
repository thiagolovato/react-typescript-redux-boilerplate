# Design System - Two Birds

Every color comes from the logo. The larger blue bird is the mentor. The smaller green bird is the mentee.
The teal where their gradients meet is the bridge between them. The page is the logo's paper, the text is the
slate ink of the birds' eyes.

## Live reference

Run `npm run dev` and open `/design-system`. It shows every token and component with the code to use it.
The page lives in `src/components/designSystem/` and exists only in dev builds. Add a section there when you add a
component to `ui/`.

## Palette

| Token | Hex | Role |
| --- | --- | --- |
| `primary-500` | `#448DE0` | Mentor bird. Tints and icons. |
| `primary-600` | `#2F74C8` | Buttons and links. Lightest blue with AA contrast on white text. |
| `secondary-400` | `#79C878` | Mentee bird. Tints and icons. |
| `secondary-700` | `#357A40` | Green text and green buttons. |
| `secondary-300` | `#ABCE31` | Chartreuse tail. Gradient end only. |
| `teal-400` | `#4EBCA3` | Bridge. Shared features (sessions). |
| `neutral-50` | `#FCFAF6` | Paper. Page and sidebar background. Matches the logo, so the image needs no frame. |
| `neutral-800` | `#2A3F4E` | Ink. Body text. |
| `neutral-900` | `#1C2B36` | Headings. |

Full scales (50 to 900) and semantic colors (`success`, `warning`, `error`, `info`) are in `src/constants/colors.ts`.

### Role colors

Color tells the user whose feature it is:

- Mentor: `primary` (blue). Example: "Find mentors" card for a mentee.
- Mentee: `secondary` (green). Example: "Find mentees" card for a mentor.
- Shared: `teal`. Example: sessions.
- Everything else: `neutral`.

`RoleBird` shows the matching bird, cropped from the logo, next to a role (register form, sidebar user).

### The perch

`bg-perch` is the blue to teal to chartreuse gradient, the branch both birds stand on. Use it once per screen at
most. Today it only appears under the birds on the login and register screens. No other gradients.

## Typography

- One family: Lexend (Google Fonts, weights 300 to 600), a geometric sans close to the logo wordmark.
- Headings: `font-semibold tracking-tight` for page titles, `font-medium` for section and card titles.
- Sentence case everywhere. No all-caps labels.

## Surfaces

- Page: paper (`bg-neutral-50`). No background gradients or images.
- Content: white with `border-neutral-200`. No shadows.
- Radius by hierarchy: `rounded-2xl` page panels, `rounded-xl` cards, `rounded-lg` buttons, inputs and list rows.

## Where the palette lives

- `src/constants/colors.ts` is the source of truth for hex values.
- `src/index.css` mirrors them in the Tailwind CSS v4 theme (`@theme`). Change both files together.
- Logo crops use `src/assets/mentor-mentee-birds-640.jpg` (65 KB). Blend it with `mix-blend-multiply` on paper or
  white so its background disappears. The full-size PNGs stay as source art.

## Components

They live in `src/components/ui/` and use Tailwind classes only.

- `Button`: `variant` (`primary`, `secondary`, `outline`, `ghost`, `success`, `warning`, `error`),
  `size` (`sm`, `md`, `lg`, `xl`), `isLoading`, `leftIcon`, `rightIcon`, `fullWidth`. Default type is `button`.
  Solid fills, no gradients.
- `Input`: `size`, `variant` (`default`, `success`, `warning`, `error`), `label`, `helperText`, `isRequired`,
  `leftIcon`, `rightIcon`, `fullWidth`. Links label and message to the field by `id`.
- `TextArea`: same options as `Input`, without icons and sizes.
- `Select`, `Checkbox`, `LanguageToggle`.
- `RoleBird`: `role` (`MENTOR`, `MENTEE`), `size` (`sm`, `md`). Decorative.
- Icons in `icons.tsx`: line icons, 1.75 stroke. Use them instead of emoji.

## Rules

- No decorative keyframes. The only animation is the `isLoading` spinner (`animate-spin`).
- Global visible focus in `src/index.css` (`outline-primary-500`).
- Write full class names in code. Tailwind does not detect names built at runtime.
