# Personal Blog

A personal portfolio and blog site built with Next.js 16, powered by MDX content stored in S3.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Content**: MDX stored in AWS S3, rendered with next-mdx-remote
- **Editor**: CodeMirror 6 with markdown syntax highlighting
- **Icons**: Hugeicons
- **Theme**: next-themes (light/dark mode)

## Architecture

### Content Model

A single `homepage.mdx` in S3 drives the entire homepage using convention-based parsing:
- `##` headings determine section type (Projects, Experience, Blogs)
- `###` items under each section are parsed into structured data (project cards, timeline items)

Blog posts are stored at `blog/{slug}.mdx` in S3 with YAML frontmatter.

### Draft/Published Versioning

Each blog post can have up to two S3 objects:
- `blog/{slug}.draft.mdx` - the working copy (admin always edits this)
- `blog/{slug}.mdx` - the published copy (public reads this)

| Action | What happens |
|--------|-------------|
| **Save** | Writes to `.draft.mdx` (auto-saves every 3s) |
| **Publish** | Copies draft to `.mdx`, deletes draft |
| **Unpublish** | Copies published to draft, deletes `.mdx` |

A new post starts as draft-only. Publishing creates the published key. Subsequent edits go to draft only. The public site only reads from `.mdx` keys.

### Admin Editor

The admin editor at `/admin` features:
- **CodeMirror 6** editor with markdown syntax highlighting, bracket matching, search (Cmd+F), and undo/redo
- **Markdown toolbar** with buttons for bold, italic, code, headings, links, images, lists, quotes, and code blocks
- **Keyboard shortcuts**: Cmd+B (bold), Cmd+I (italic), Cmd+E (inline code), Cmd+Shift+K (link)
- **Live preview** side-by-side with a resizable split pane
- **Zen mode** for distraction-free writing (hides preview, Esc to exit)
- **Auto-save** with 3-second debounce
- **Status badges** showing Draft / Published / Edited state
- **Frontmatter form** for title, description, and date

### Authentication

Admin access uses magic link authentication:
- Magic links sent via AWS SES
- JWT tokens with HTTP-only session cookies
- Route group `(authenticated)` under `/admin` for protected pages

## Project Structure

```
app/
  admin/
    (authenticated)/       # Protected admin pages (with nav)
      blog/                # Blog list, editor
      homepage/            # Homepage editor
    login/                 # Login page (no nav)
  api/
    admin/
      blog/                # CRUD + publish/unpublish APIs
      homepage/            # Homepage API
      preview/             # Markdown preview API
    auth/                  # Magic link auth APIs
  blog/                    # Public blog pages
components/
  admin/                   # Editor, toolbar, preview components
  sections/                # Homepage section renderers
  layout/                  # Shared layout components
lib/
  mdx/                     # MDX compilation with styled components
  parser/                  # Homepage MDX parser
  s3/                      # S3 client and content functions
```

## Getting Started

```bash
pnpm install
pnpm dev
```

### Environment Variables

Create a `.env` file with:

```
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
SES_FROM_EMAIL=
JWT_SECRET=
ADMIN_EMAIL=
NEXT_PUBLIC_BASE_URL=
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
