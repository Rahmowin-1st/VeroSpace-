# VeroSpace — Conversion + Motion Master Plan

Status: CODE-ONLY. DO NOT DEPLOY.
Branch: `verospace-conversion-motion-v1`

## Non-negotiables
- Preserve VeroSpace identity: navy / ivory / honey timber / liquid glass.
- No external-brand font/runtime/UI references or borrowed visual language.
- No fake reviews, awards, client logos, client counts, performance numbers or claimed customer results.
- Portfolio remains explicitly concept work where applicable.
- Native scrolling only. No scroll hijack, no ScrollSmoother, no snap, no forced scroll position.
- GSAP + ScrollTrigger may animate presentation only.
- `prefers-reduced-motion` must get a clean static experience.
- Primary conversion action remains consultation.
- Keep copy short, literal, confident and useful.

## Reference direction
The user-supplied reference set establishes the target DNA:
- compact / tiny-home scale used intelligently;
- white or ivory envelope;
- warm oak / honey timber;
- daylight as a design material;
- lofted / vertical volume where possible;
- restrained black metal accents;
- practical storage and built-ins visible in the composition.

Fresh supporting image references selected from Unsplash pages marked free under the Unsplash License:
1. `photo-1674217444141-d8ca3bc66584` — minimal white kitchen + timber floor.
2. `photo-1782862965003-86af93ef9cf8` — sunlight + long timber furniture.
3. `photo-1625585598750-3535fe40efb3` — bright white room + timber detail.
4. `photo-1771371428960-35a50c2d4e7c` — bright modern residential interior.
5. `photo-1784550283676-dba14673cfe7` — sunlight / warm wood reference.
6. `photo-1785706313842-541f09684d5f` — bright room / timber floor reference.
7. `photo-1623286728232-9107cb8f6b11` — real tiny-home loft interior.
8. `photo-1623286728208-672dcecba73a` — tiny-home loft + built-in storage detail.
9. `photo-1768413292067-fd4c2bdd64c5` — modern timber mezzanine / cabin interior.

## Conversion sequence
1. **Outcome — Hero**
   - One user-centered outcome.
   - One sentence explaining what VeroSpace actually coordinates.
   - Primary CTA: Book a consultation.
   - Secondary CTA: Explore projects.

2. **Trust — immediate proof strip**
   - No invented social proof.
   - Show the working model: clear scope, one direction, decisions carried to handover, concept work labeled honestly.

3. **Proof — portfolio**
   - Project cards lead with visual evidence.
   - Each card shows problem + design result in one line.
   - Project dialog remains image-first and states scope / focus / problem solved.

4. **Offer — services**
   - Reduce service copy.
   - Show what the user actually gets, not generic agency language.

5. **Taste — material / reference gallery**
   - More imagery matching the supplied tiny-home / oak / white-shell direction.
   - Compact captions only.

6. **Certainty — process**
   - Header: user must know what happens next.
   - Five steps stay but copy becomes shorter.
   - Motion sequence shows progress without pinning or hijacking scroll.

7. **Decision — consultation**
   - CTA bridge before form.
   - Existing strong consultation form/error/send-state preserved.
   - Explain what to send, not why the company is great.

## Motion grammar
### Page load
- Header settles from above with liquid-glass focus.
- Hero image uses controlled scale + clip reveal.
- Eyebrow, headline lines, lede and CTAs enter on different axes/timings, like a composed slide sequence.
- Trust strip resolves immediately after CTA so trust follows attention.

### Scroll
- Project cards alternate left/right/scale/clip reveals.
- Project images get subtle GSAP scrub parallax only; no scroll control.
- Service cards use varied rotational/axis entrances.
- Reference gallery tiles reveal with staggered masks and tiny perspective shifts.
- Process steps arrive from different directions while a progress line draws naturally.
- Principles use soft scale/tilt reveals.
- Contact copy and form converge from opposite sides.

### Interaction
- Existing tactile press/ripple stays.
- Process, service, principle and project cards visibly respond to press.
- CTAs get short magnetic-like hover only on fine pointers; no cursor hijack.

## Gates
- G1 Reference bank + strategy — GREEN.
- G2 Information architecture + copy — GREEN.
- G3 Image gallery + portfolio result framing — GREEN.
- G4 GSAP load choreography — coded, pending QA.
- G5 ScrollTrigger motion system — coded, pending QA.
- G6 CTA + consultation conversion pass — coded, pending QA.
- G7 320–1920 local Chromium QA + reduced motion + no overflow + no scroll hijack — pending.

## Final acceptance before any deployment
- All gates GREEN.
- No production/main mutation.
- No Vercel deployment.
- User reviews code/preview strategy first.
