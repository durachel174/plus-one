# Plus One

A curated social dining platform where open restaurant seats are shared with people who have the right taste.

**Live:** [plus-one-eosin.vercel.app](https://plus-one-eosin.vercel.app)

---

## What it is

Plus One is a small dining club, not a marketplace. When a reservation already exists and a seat opens up, the host shares it. AI turns their note into a Dinner Card. The right person finds it, requests the seat, and the host decides who joins.

> Not a date.
> Not networking.
> Just two people who both wanted to be there.

This is different from events, group dinners, or marketplaces — the reservation already exists. The platform fills the seat.

The constraint is not finding guests — it's giving hosts confidence to share the seat. Plus One solves this through context, not volume.

---

## Access model

Membership is based on fit — not activity, not volume.

```
Anyone        → landing page, feed (read-only), host preview
Signed up     → request membership (sets flag: pending)
Pending       → browse feed, see host preview, /pending if accessing protected routes
Approved      → full access to host a dinner + seat requests
```

Membership status is a flag on the user profile (`null | pending | approved`). Protected routes check this flag at the middleware level before rendering. Approval is currently manual — reviewed and set via Supabase.

---

## Product insight

The hardest part is not matching people.

It's making the first dinner feel natural.

Plus One doesn't rely on volume or endless browsing. It relies on context — so that when a dinner appears, it already feels right.

---

## AI integration

Four distinct AI integration points, each producing structured JSON that drives product logic:

### 1. Listing Enhancement — Dinner Card generation
When a host writes a note about their dinner, the AI converts unstructured free text into a structured Dinner Card with a title, 2-sentence summary, 3 match tags, dining style, and social energy classification.

```
Host note (free text)
  ↓
/api/test-dinner-card
  ↓
{
  card_title, card_summary, card_good_match,
  dining_style, social_energy
}
  ↓
Stored in Supabase · Rendered as Dinner Card
```

The system is designed to preserve the host's intent — whether it's a birthday dinner, a long-awaited reservation, or a last-minute cancellation — not just describe the restaurant.

The system prioritizes faithfulness over fluency — preserving the host's intent matters more than producing polished copy.

The card generated in the preview is what gets published — no second AI call.

### 2. Occasion detection
A lightweight extraction step identifies occasions (e.g. birthday, celebration, farewell) and injects them into the prompt to ensure the output reflects the actual context, not just the restaurant's reputation.

### 3. Compatibility scoring *(v1.5)*
Planned: semantic scoring between host and guest profiles based on dining preferences (e.g. cuisine style, pacing, social energy).

### 4. Message moderation *(v1.5)*
Planned: classification of seat request messages (safe / suspicious / blocked) before delivery to hosts.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) · Tailwind CSS |
| Backend | Next.js API routes (Node.js) |
| Database | Supabase (Postgres + Auth) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Hosting | Vercel |

---

## Architecture

AI always produces structured JSON, not raw text. Outputs are stored as typed database fields and drive product logic — not just displayed as text.

```
User input (free text)
  ↓
Next.js API route (server-side)
  ↓
Anthropic API call  ←  structured prompt
  ↓
JSON validated + stored in Supabase
  ↓
Product UI renders Dinner Card
```

The Anthropic API key never touches the client. All AI calls go through server-side API routes.

---

## Core user flows

**Host**
1. Sign up → request membership → get approved
2. Create listing → write note → AI generates Dinner Card → preview → publish
3. Receive seat requests → review guest + message → accept or decline

**Guest**
1. Sign up → request membership → get approved
2. Browse feed → view Dinner Card
3. Request seat → write message
4. Wait for host decision → receive contact details on acceptance

**Pre-membership**
1. Land on homepage → browse feed (read-only)
2. Try host preview → see real AI card generation without account
3. Request membership → sign up → submit application → pending state

---

## Project structure

```
app/
  page.tsx                    # Landing page (smart membership CTA)
  feed/page.jsx               # Dinner feed (public, read-only)
  host/page.jsx               # Host form + AI card preview (approved only)
  host-preview/page.jsx       # Mock host form — public, no auth required
  dinners/[id]/page.jsx       # Dinner detail + seat request flow (approved only)
  membership/page.jsx         # Membership request form
  pending/page.jsx            # Shown to pending members on protected routes
  login/page.jsx              # Auth (login + signup)
  test/page.jsx               # AI prompt tester (internal)
  api/
    test-dinner-card/route.js # Listing enhancement prompt
    dinners/route.js          # Create + fetch dinners
    dinners/[id]/route.js     # Single dinner
    requests/route.js         # Seat requests
    membership/route.js       # Membership applications

components/
  ui/Nav.jsx                  # Navigation (auth-aware, smart logo routing)
  dinner/DinnerCard.jsx       # Reusable card component

lib/
  supabase.js                 # Admin + client Supabase clients
  supabase-server.js          # Server-side auth client
  supabase-client.js          # Browser auth client

middleware.js                 # Route protection + membership status checks
```

---

## Database schema

```sql
profiles              -- extends Supabase auth.users, membership_status (null | pending | approved)
dinners               -- restaurant, date, AI-generated card fields, status
requests              -- dinner_id, guest_id, message, moderation_status
membership_requests   -- application responses, user_id, status
```

---

## Local setup

```bash
# Install dependencies
npm install

# Environment variables
cp .env.example .env.local
# Fill in: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
#          NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Start dev server
npm run dev
```

To approve a member manually:
```sql
update public.profiles
set membership_status = 'approved'
where id = 'user-uuid';
```

---

## What's next (v1.5)

- **Alive Dinner Card** — a shared pre-dinner context where the host posts a question and the guest responds when requesting, creating alignment before the dinner
- **Compatibility scoring** — semantic matching between host and guest profiles based on dining preferences
- **Message moderation** — AI classification before messages reach hosts
- **Admin view** — simple dashboard to review and approve membership requests
- **Post-dinner feedback** — unlocks better matching over time
- **Verified reservations** — confirmation screenshot before listing goes live