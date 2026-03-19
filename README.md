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

Membership status is a flag on the user profile (`null | pending | approved`). Protected routes check this flag at the middleware level before rendering. Approval triggers AI bio generation from the member's application, then sets the flag via a protected API route.

---

## Product insight

The hardest part is not matching people.

It's making the first dinner feel natural.

Plus One doesn't rely on volume or endless browsing. It relies on context — so that when a dinner appears, it already feels right.

---

## AI integration

Five distinct AI integration points, each producing structured output that drives product logic:

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

The system prioritizes faithfulness over fluency — preserving the host's intent matters more than producing polished copy. The card generated in the preview is what gets published — no second AI call.

### 2. Occasion detection
A lightweight extraction step identifies occasions (e.g. birthday, celebration, farewell) and injects them into the prompt to ensure the output reflects the actual context, not just the restaurant's reputation.

### 3. Alive Dinner Card — host question assist
Hosts can write a question for their guest to answer at request time. For hosts who aren't sure what to ask, a keyword-to-question generator produces a single conversational prompt from free-text intent — not a list, not a dropdown. The generated question fills the field and stays editable, so the host's voice is preserved.

```
Host keywords (free text)
  ↓
/api/alive-question
  ↓
One question (under 20 words, conversational)
  ↓
Auto-fills textarea · Host edits · Saved to dinners.host_question
```

The guest sees the question when requesting a seat and answers inline. The Q&A is surfaced on the host review screen as the center of gravity for the accept/pass decision.

### 4. Member bio generation
When a member is approved, their membership application (go-to spots, wishlist, cuisines, dining style, intent) is converted into a 2-sentence third-person bio. The bio appears on the host review screen so hosts can read the person before deciding.

```
membership_requests row
  ↓
/api/admin/approve
  ↓
2-sentence bio (under 40 words, taste-focused)
  ↓
Stored in profiles.bio · Shown on host review screen
```

### 5. Compatibility scoring *(v1.5)*
Planned: semantic scoring between host and guest profiles based on dining preferences.

### 6. Message moderation *(v1.5)*
Planned: classification of seat request messages (safe / suspicious / blocked) before delivery to hosts.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | Next.js API routes (Node.js) |
| Database | Supabase (Postgres + Auth) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Hosting | Vercel |
| Fonts | Cormorant Garamond · DM Sans |

---

## Architecture

AI always produces structured output, not raw text. Outputs are stored as typed database fields and drive product logic — not just displayed as text.

```
User input (free text)
  ↓
Next.js API route (server-side)
  ↓
Anthropic API call  ←  structured prompt
  ↓
JSON validated + stored in Supabase
  ↓
Product UI renders from structured fields
```

The Anthropic API key never touches the client. All AI calls go through server-side API routes.

---

## Core user flows

**Host**
1. Sign up (name + email + password) → request membership → get approved (bio generated)
2. Create listing → write note → AI generates Dinner Card → add guest question → preview → publish
3. Receive seat requests → review guest name, bio, question answer, and message → accept or pass
4. Accepted dinner appears in Upcoming on My Dinners (showing guest name)

**Guest**
1. Sign up → request membership → get approved
2. Browse feed → view Dinner Card
3. Request seat → answer host's question → write message
4. Wait for host decision → appears in Upcoming on My Dinners if accepted (showing host name)

**Pre-membership**
1. Land on homepage → browse feed (read-only)
2. Try host preview → see real AI card generation without account
3. Request membership → sign up → submit application → pending state

---

## Project structure

```
app/
  page.tsx                        # Landing page (smart membership CTA)
  feed/page.jsx                   # Dinner feed (public, read-only)
  host/page.jsx                   # Host form + AI card preview (approved only)
  host/dinners/page.jsx           # My Dinners — Upcoming + Hosting sections
  host/dinners/[id]/page.jsx      # Host review screen — incoming requests
  host-preview/page.jsx           # Mock host form — public, no auth required
  dinners/[id]/page.jsx           # Dinner detail + seat request flow (approved only)
  membership/page.jsx             # Membership request form
  pending/page.jsx                # Shown to pending members on protected routes
  login/page.jsx                  # Auth (login + signup with name)
  test/page.jsx                   # AI prompt tester (internal)
  api/
    test-dinner-card/route.js     # Listing enhancement prompt
    dinners/route.js              # Create + fetch dinners
    dinners/[id]/route.js         # Single dinner (with host profile join)
    dinners/mine/route.js         # Host's own dinners with pending counts
    requests/route.js             # Seat requests (GET, POST, PATCH)
    requests/accepted/route.js    # Guest's accepted dinners
    membership/route.js           # Membership applications
    alive-question/route.js       # Keyword → single host question
    admin/approve/route.js        # Approve member + generate bio
    auth/signup/route.js          # Server-side signup (writes full_name via admin)

components/
  ui/Nav.jsx                      # Navigation (auth-aware, shows name, membership-gated links)
  dinner/DinnerCard.jsx           # Reusable card component
  dinner/AliveQuestion.jsx        # Host question field with AI assist drawer

lib/
  supabase.js                     # Admin + client Supabase clients
  supabase-server.js              # Server-side auth client
  supabase-client.js              # Browser auth client

middleware.js                     # Route protection + membership status checks
```

---

## Database schema

```sql
profiles
  id, full_name, bio, membership_status (null | pending | approved)

dinners
  id, host_id, restaurant, date_text, price_range, seats_open,
  host_note_raw, host_question,
  card_title, card_summary, card_good_match, dining_style, social_energy,
  status (open | interest_check)

requests
  id, dinner_id, guest_id, message, guest_answer,
  status (pending | accepted | passed),
  moderation_status (pending | safe | suspicious | blocked)

membership_requests
  id, user_id, goto_spots, wishlist, cuisines, price_range,
  dining_style, intent, weekend, note, status
```

---

## Local setup

```bash
# Install dependencies
npm install

# Environment variables
cp .env.example .env.local
# Fill in:
#   ANTHROPIC_API_KEY
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   ADMIN_SECRET

# Start dev server
npm run dev
```

To approve a member and generate their bio:
```bash
curl -X POST http://localhost:3000/api/admin/approve \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your-secret" \
  -d '{"user_id": "uuid-here"}'
```

---

## What's next (v1.5)

- **Compatibility scoring** — semantic matching between host and guest profiles based on dining preferences
- **Message moderation** — AI classification before messages reach hosts
- **Admin view** — simple dashboard to review and approve membership requests without curl
- **Post-dinner feedback** — unlocks better matching over time
- **Verified reservations** — confirmation screenshot before listing goes live
- **Profile page** — visible after dinner history and feedback exist