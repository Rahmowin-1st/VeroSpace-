# VeroSpace — Conversion + Motion Master Plan

Status: CODE-ONLY GREEN. DO NOT DEPLOY.
Branch: `verospace-conversion-motion-v1`

## Non-negotiables
- Preserve VeroSpace identity: navy / ivory / honey timber / liquid glass.
- No external-brand font/runtime/UI references or borrowed visual language.
- No fake reviews, awards, client logos, client counts, performance numbers or claimed customer results.
- Portfolio remains explicitly concept work where applicable.
- Native scrolling only. No scroll hijack, no ScrollSmoother, no snap, no forced scroll position.
- GSAP + ScrollTrigger animate presentation only.
- `prefers-reduced-motion` gets a clean static experience.
- Primary conversion action remains consultation.
- Copy stays short, literal, confident and useful.

## Reference direction
The user-supplied reference set establishes the target DNA:
- compact / tiny-home scale used intelligently;
- white or ivory envelope;
- warm oak / honey timber;
- daylight as a design material;
- lofted / vertical volume where possible;
- restrained black metal accents;
- practical storage and built-ins visible in the composition.

Nine supporting image references are used in the code-only material board. The final three are verified direct tiny-home assets:
1. `photo-1674217444141-d8ca3bc66584` — minimal white kitchen + timber floor.
2. `photo-1782862965003-86af93ef9cf8` — sunlight + long timber furniture.
3. `photo-1625585598750-3535fe40efb3` — bright white room + timber detail.
4. `photo-1771371428960-35a50c2d4e7c` — bright modern residential interior.
5. `photo-1784550283676-dba14673cfe7` — sunlight / warm wood reference.
6. `photo-1785706313842-541f09684d5f` — bright room / timber floor reference.
7. `photo-1623286728232-9107cb8f6b11` — tiny-home loft + built-in storage.
8. `photo-1588621356760-480a27a2d105` — compact tiny-home kitchen + loft ladder.
9. `photo-1673246469598-6a73637fd6a8` — warm timber tiny-home loft bedroom.

## Conversion sequence
1. **Outcome — Hero**
   - User-centered outcome first.
   - One sentence explains what VeroSpace coordinates.
   - Primary CTA: Book a consultation.
   - Secondary CTA: Explore projects.
   - Friction reducer: “No polished brief needed.”

2. **Trust — immediate proof strip**
   - No invented social proof.
   - Scope first, one direction, daily-use thinking, transparent concept labeling.

3. **Proof — portfolio**
   - Five concept studies remain clearly labeled.
   - Each card shows the problem plus a compact “Design result”.
   - Project dialog stays image-first with scope / focus / problem solved.

4. **Offer — services**
   - Four concise deliverables.
   - No agency filler.

5. **Taste — material / reference gallery**
   - Nine-image editorial mosaic aligned to white-shell / honey-timber / tiny-home references.
   - Captions are compact and descriptive.

6. **Certainty — process**
   - Five short stages.
   - Progress rail animates without pinning or controlling scroll.

7. **Decision — CTA + consultation**
   - Decision CTA appears after proof + process.
   - Existing consultation validation / send-state UI is preserved.
   - Form explains exactly what the user should send.

## Motion grammar
### Page load
- Header settles from above with liquid-glass focus.
- Hero image uses controlled scale + clip reveal.
- Eyebrow, headline lines, lede and CTAs enter on different axes/timings.
- The sequence reads like a composed presentation, not a generic fade stack.

### Scroll
- Project cards alternate left / right / vertical / rotate vectors.
- Desktop project and reference images use subtle scrub parallax only.
- Service cards use varied rotational / 3D axis entrances.
- Reference tiles use varied masks, directions and perspective shifts.
- Process steps arrive from different vectors while the rail draws naturally.
- Principles use controlled scale / tilt reveals.
- Contact copy and form converge from opposite sides.

### Interaction
- Tactile press/ripple stays on buttons, project cards, services, process and principles.
- No cursor hijack.
- Reduced-motion users receive static, fully visible content.

## Gates
- G1 Reference bank + strategy — **GREEN**.
- G2 Information architecture + copy — **GREEN**.
- G3 Image gallery + portfolio result framing — **GREEN**, 9/9 reference images decoded in Chromium.
- G4 GSAP page-load choreography — **GREEN**.
- G5 ScrollTrigger motion system — **GREEN**, 54 triggers on mobile and 69 on desktop; no pin/snap.
- G6 CTA + consultation conversion pass — **GREEN**.
- G7 320–1920 local Chromium QA + reduced motion + no horizontal overflow + native scroll — **GREEN**.

## QA evidence
GitHub Actions run: `33646064560`

Validated viewports:
- 320 × 700
- 360 × 780
- 390 × 844
- 430 × 932
- 768 × 1024
- 1024 × 768
- 1366 × 768
- 1440 × 900
- 1600 × 900
- 1920 × 1080

Every viewport passed with 9/9 reference images decoded. Reduced-motion passed separately.

## Deployment state
- `main` was not mutated in this round.
- Vercel production was not deployed or changed.
- This branch is ready for visual review before any deployment decision.
