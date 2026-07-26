# MVP Locked Principles

These principles are locked. They define what Pathoro is for, independent of what has been built so far. The current MVP (three clickable screens, mock data) does not yet implement all of these — it should not contradict them.

## Human Relationship Mapping

Pathoro does not connect people randomly by interest. Pathoro connects people when they are meaningfully related along a journey. Pathoro maps the relationship between a person, an opportunity, and the people who can help make that opportunity real.

## Opportunity Posting

Pathoro is not only a place where people find opportunities. It is also a place where people, groups, businesses, mentors, teachers, organizers, and communities can make opportunities visible to the right people at the right point in their journey. Posting an opportunity on Pathoro is not the same as posting an event, job, or listing. The goal is not to broadcast opportunities to everyone. The goal is to place opportunities where they become meaningful and reachable.

## Opportunity Intelligence Layer

Pathoro does not ask what is happening nearby. It asks what real-world access point could help this person move.

Every opportunity Pathoro shows — on the admin review screen, on a route-planning card, or on its detail page — is framed around why it appeared, what path it supports, what real-world access it creates, what it could open next, and how to take the next step. That framing is not cosmetic copy; it is the difference between an events feed and a path. Product language should prefer *opportunity*, *opening*, *route stop*, *real-world next step*, and *access point* over *event*, *listing*, or *activity*.

## Opportunity, Not Consumption

**"Opportunity, not consumption."** A Pathoro opportunity should be evaluated by what it can open for the user, not merely whether it is something they can attend or buy.

A lot of classes are consumer experiences — they may be useful, but they often serve someone else's business (the organizer's) more than the user's own path forward. Pathoro should not over-index on classes or events just because they are the easiest thing to find and extract. The deeper product finds opportunities that create agency, access, income, skill, ownership, leverage, proximity, or compounding next steps — not just something pleasant to attend.

**"The modern opportunity problem is not just finding events. It is finding hidden, underpriced, or overlooked access points that can help someone change their position."** This is why Pathoro's scout has a dedicated hidden-opportunity search mode (v0.12) alongside its route-relevant and gateway-community modes — the same principle expressed as three different search strategies, not three different products.

Examples of higher-agency opportunities, beyond the class/workshop default:

- Sourcing clothes/items from flea markets to resell on eBay
- Estate sales, liquidation sales, thrift arbitrage
- Vendor market applications
- Makerspace open shop nights
- Apprenticeship / shadowing opportunities
- Small-business grants or local entrepreneurship programs
- Volunteer roles that create proximity to useful people
- Community organizations where someone can build trust over time
- Beginner-friendly ways to test a business idea
- Local unmet needs someone could solve
- Workshops — but only when they lead to access, skill, a credential, or a next door, not just an afternoon well spent

Every opportunity — during admin review, in the scout's classification, or on a route-planning card — should be weighed against these dimensions (refined in v0.12 from the original seven questions to name relationship-building and cost/friction explicitly):

- Agency potential — does this put the person in the driver's seat, or just in the audience?
- Income potential — could this create real income, not just an expense?
- Ownership potential — does this create ownership or agency, versus renting someone else's experience?
- Access/proximity created — does this create access or proximity to people, places, or resources?
- Skill built — does this build a skill that outlasts the opportunity itself?
- Relationship/network potential — does this build a specific relationship or connection that could compound?
- Compounding potential — does this lead somewhere further, or end when it ends?
- Cost/friction — what does it actually cost in money, time, or effort to take this step?
- Is this mostly a consumer activity? — the honest fallback question when none of the above clearly apply.

A "yes" to any of the first six is a real opportunity. A "yes" only to the last, with cost/friction as the main consideration, is consumption — still possibly worth surfacing, but not what Pathoro should reach for first.

## Gateway Communities

Pathoro should eventually map not just individual opportunities, but pathways into opportunity *networks*. This is a locked principle to build toward — v0.11 implements the scout-side query and classification support for it; the full mapping (an actual opportunity graph) is future work.

**A gateway community is a place, group, institution, neighborhood, or cultural/business network that can open paths into wider opportunity worlds.**

Example: Chinatown in New York City is not just a neighborhood. It can be a gateway into language, culture, trade, import/export, food businesses, logistics, sourcing, diaspora networks, travel, mentorship, and China-connected opportunity pathways. The same is true, in its own way, of a makerspace, a coworking space, a community garden, an immigrant business corridor, a religious or community institution, or a public library — each is a door into a wider network, not just a single opportunity.

### This must be handled respectfully

- Do not stereotype communities.
- Do not treat communities as resources to extract from.
- Emphasize mutuality, trust, contribution, learning, and relationship.
- Opportunities surfaced through a gateway community must be legitimate and community-respecting.
- Pathoro should help users find bridges into a community, not exploit or bypass the community's own relationships and norms.

In practice, this means Pathoro's tools respond to *what a person says they're trying to do* (their own stated path/goal) and surface the *general type* of institutional bridge relevant to it — a chamber of commerce, a cultural association, a language exchange group — rather than ever assuming or inferring a person's ethnicity, culture, or community membership. The system is structure-based, not identity-based: it doesn't hardcode assumptions about any particular group, and it doesn't try to detect what community someone "should" belong to.

### Product language

- **Gateway community** — a place, group, institution, or network that can open paths into a wider world of opportunity: trade, language, mentorship, culture, business.
- **Bridge person** — someone already inside a gateway community who can vouch for, introduce, or orient a newcomer. The human version of a gateway.
- **Access pathway** — the concrete, legitimate, respectful first step from outside a gateway community to meaningfully inside it.
- **Place-based opportunity network** — a gateway community anchored to a physical place (a neighborhood, a market district) rather than a purely online or institutional one.
- **Diaspora opportunity route** — a path into opportunity that runs *through* a diaspora community's own institutions, trade, and relationships, with permission and mutuality — not around them.
- **Community-based route** — a route (in Pathoro's five-route model) whose next step runs through a gateway community rather than a solo action.
- **Opportunity graph** — the larger idea this is building toward: opportunities aren't a flat list. They connect to each other and to gateway communities, forming a graph a person can move through over time.

### Examples of gateway communities

| Gateway community | Can open into |
|---|---|
| Chinatown (or any diaspora neighborhood) | China-connected trade, language, sourcing, food, logistics, cultural/business networks |
| Makerspaces | Hardware, robotics, fabrication, startup/building networks |
| Coworking spaces | Founders, freelancers, startup jobs, investors |
| Community gardens | Food systems, sustainability, volunteering, local relationships |
| Immigrant business corridors | Trade, language, entrepreneurship, service networks |
| Religious/community institutions | Trust, service, mentorship, support networks |
| Public libraries | Free education, career resources, community programs |

## Trail Markers, Not Comments

**"People who walked this path can leave signs for the next person."**

People should not have to discover opportunity alone. They should be able to benefit from the path knowledge of others. Pathoro does not have a generic comment section — it has **trail markers**: structured notes left on an opportunity or route by someone with real insight, experience, or context that could help the next person.

A trail marker is not a reaction, a reply, or a discussion post. Each one has a specific type, because "path knowledge" comes in specific shapes:

- **Practical tip** — something that makes this easier to actually do.
- **Hidden requirement** — a prerequisite that wasn't obvious from the listing.
- **Access advice** — how to actually get in, get noticed, or get a yes.
- **What it opened** — what this concretely led to for someone who took it.
- **Warning / friction** — a real cost, catch, or thing to watch out for.
- **Bridge person or group** — someone or somewhere that can vouch for or introduce the next person.
- **Better first step** — a lower-friction way in than the one listed.
- **Cheaper alternative** — a way to get similar value for less.
- **Opportunity quality** — is this, in the marker-leaver's experience, a real opportunity or mostly a consumer activity?

This is the same **[Opportunity, Not Consumption](#opportunity-not-consumption)** lens applied socially: the people who've already walked a path are often the ones best positioned to say whether it actually opened something. Trail markers are alpha-safe by design — no accounts, no likes, no follows, no messaging, no open social feed. Every marker is reviewed before it goes live, the same review discipline Pathoro applies to opportunities themselves.

### Product language

- **Trail marker**, not comment
- **Path knowledge**, not user-generated content
- **Signs from people ahead**, not posts
- **Practical context**, **hidden friction**, **access advice** — not "tips and tricks"

Avoid: comments, posts, social feed, discussion thread, reviews.

## People Are Part of the Landscape

People are not a social feature in Pathoro. People are part of the opportunity landscape. They appear when they can make a path more reachable, more human, or more possible.

## Five Direction Questions

Pathoro should eventually use five questions to orient a user. This is not implemented in the UI yet — it is documented here as a locked product principle to build toward.

1. What are you trying to move toward?
2. What should this make room for?
3. Where are you starting from?
4. What would make this feel more reachable?
5. What could you try first?

Each question maps to a distinct part of orienting someone within their journey:

| Question | Maps to |
|---|---|
| What are you trying to move toward? | Direction |
| What should this make room for? | Meaning / fuel |
| Where are you starting from? | Current location |
| What would make this feel more reachable? | Route type / support need |
| What could you try first? | First movement |
