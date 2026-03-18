# Plus One

A curated social dining platform that connects people with an open restaurant seat to guests who share their taste in food and conversation.

**Live:** [plus-one-eosin.vercel.app](https://plus-one-eosin.vercel.app)

---

## What it is

Plus One is a small dining club, not a marketplace. When someone makes a reservation and their guest cancels, they post the open seat. AI turns their note into a Dinner Card. The right person finds it, requests the seat, and the host decides who joins.

The product solves one problem: **how do two strangers feel comfortable having dinner together?** The answer is context — shared taste, intentional framing, and a host who already made a plan.

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

The prompt uses a two-step approach: first fetching a one-line restaurant description, then generating the card with both the host's note and restaurant context — so the output reflects both what the host said and where they're going.

### 2. Occasion detection
A keyword extraction layer runs before the AI call and injects detected occasions (birthday, anniversary, farewell, etc.) directly into the prompt as a hard instruction — ensuring the card reflects the actual context, not just the restaurant's reputation.

### 3. Compatibility scoring *(v1.5)*
Planned: semantic scoring between host and guest profiles using extracted dining attributes.

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
1. Sign up → complete profile
2. Create listing → write note → AI generates Dinner Card → preview → publish
3. Receive seat requests → review guest + message → accept or decline

**Guest**
1. Browse feed → view Dinner Card
2. Request seat → write message
3. Wait for host decision → receive contact details on acceptance

---

## Project structure

```
app/
  page.tsx                    # Landing page
  feed/page.jsx               # Dinner feed
  host/page.jsx               # Host form + AI card preview
  dinners/[id]/page.jsx       # Dinner detail + seat request flow
  login/page.jsx              # Auth (login + signup)
  test/page.jsx               # AI prompt tester (internal)
  api/
    test-dinner-card/route.js # Listing enhancement prompt
    dinners/route.js          # Create + fetch dinners
    dinners/[id]/route.js     # Single dinner
    requests/route.js         # Seat requests

components/
  ui/Nav.jsx                  # Navigation
  dinner/DinnerCard.jsx       # Reusable card component

lib/
  supabase.js                 # Admin + client Supabase clients
  supabase-server.js          # Server-side auth client
  supabase-client.js          # Browser auth client
```

---

## Database schema

```sql
profiles       -- extends Supabase auth.users
dinners        -- restaurant, date, AI-generated card fields, status
requests       -- dinner_id, guest_id, message, moderation_status
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

# Run database migrations (Supabase SQL editor)
# See schema in /docs/schema.sql

# Start dev server
npm run dev
```

---

## What's next (v1.5)

- **Alive Dinner Card** — host posts a question, guest answers when requesting
- **Compatibility scoring** — semantic matching between host and guest profiles
- **Message moderation** — AI classification before messages reach hosts
- **Post-dinner feedback** — unlocks better matching over time
- **Verified reservations** — confirmation screenshot before listing goes live

---

## Resume bullets

> Built LLM-powered listing enhancement that converts free-text host notes into structured Dinner Cards (title, summary, match tags, dining style, social energy)
>
> Designed occasion detection layer that extracts keywords from host input and injects them as hard prompt instructions — ensuring AI output reflects actual context
>
> Architected server-side AI pipeline where Anthropic API calls never touch the client — structured JSON outputs stored as typed DB fields and drive product logic
>
> Built full-stack social dining MVP: Next.js 14, Supabase (Postgres + Auth), Anthropic Claude API, deployed on Vercel