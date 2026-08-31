# VeroSpace — Full Experience Master

Cumulative working build for the VeroSpace premium interior design / renovation landing page.

## Preserved
- VeroSpace liquid-glass visual system
- independent desktop + mobile navigation layouts
- Mobile Master + Mobile Scroll Master behavior
- no video/story section or video asset
- Chrome/Android long-press suppression outside editable fields
- in-site consultation form with required-field validation
- Vercel Function + Resend delivery flow
- 3s minimum sending state, success/failure/offline full-screen states, 15s offline window

## Desktop Master additions
- cinematic hero scale and layered depth
- compacting liquid-glass header with active-section navigation
- persistent desktop journey/progress rail + back-to-top control
- native-scroll visual choreography (no wheel hijacking)
- scroll-responsive ambient depth and section parallax
- cursor-following restrained lighting field
- magnetic CTAs and controls
- cursor-aware project / testimonial tilt
- staggered reveal choreography
- spatial project cards and richer hover states
- sticky service overview and deeper active service rows
- animated material meters and editorial material scene
- connected process journey with depth feedback
- richer proof/testimonial glass scenes
- mouse-drag horizontal More Spaces reel
- sticky desktop contact narrative with refined form focus states
- reduced-motion fallback

## QA performed
- JavaScript syntax check: pass
- Vercel API function syntax + mocked method/validation/success paths: pass
- CSS parsing: 0 top-level parse errors
- HTML IDs unique
- internal anchors/data-scroll targets resolve
- 5 required consultation fields preserved
- no `mailto:` flow
- no video tags/assets
- desktop controls are isolated to desktop media rules; Mobile Master remains in place

Browser screenshot automation is blocked by the execution environment administrator, so final visual browser/device QA must still be run on the deployed preview before production freeze.

## Deployment
Static Vercel-ready project. Keep `index.html`, `styles.css`, `script.js`, `vercel.json`, `api/consultation.js`, and `assets/` at repository root as packaged.
