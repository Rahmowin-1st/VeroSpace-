from pathlib import Path
import re

root = Path('.')
runtime = []
for p in root.rglob('*'):
    if not p.is_file():
        continue
    if any(part in {'.git', '.github', '.qa', 'node_modules'} for part in p.parts):
        continue
    if p.suffix.lower() in {'.css', '.js', '.html'}:
        runtime.append(p)


def clean_filter_value(value: str) -> str:
    value = re.sub(r'\bblur\([^)]*\)', '', value, flags=re.I)
    value = re.sub(r'\s+', ' ', value).strip()
    return value or 'none'


for p in runtime:
    s = p.read_text()
    if p.suffix.lower() == '.css':
        s = re.sub(r'(?i)-webkit-backdrop-filter\s*:[^;{}]+;?', '', s)
        s = re.sub(r'(?i)(?<!webkit-)backdrop-filter\s*:[^;{}]+;?', '', s)

        def repl(m):
            return f"{m.group(1)}{clean_filter_value(m.group(2))};"

        s = re.sub(r'(?i)(?<!backdrop-)\b(filter\s*:\s*)([^;{}]+);', repl, s)
    elif p.suffix.lower() == '.js':
        s = re.sub(r",\s*filter\s*:\s*['\"]blur\([^'\"]*\)['\"]", '', s, flags=re.I)
        s = re.sub(r"filter\s*:\s*['\"]blur\([^'\"]*\)['\"]\s*,", '', s, flags=re.I)
    p.write_text(s)

safe = Path('ultra-safe.css')
s = safe.read_text()
marker = '/* NO-BLUR OPTICAL LIQUID GLASS */'
if marker not in s:
    s += r'''

/* NO-BLUR OPTICAL LIQUID GLASS */
:root{
  --optical-glass-light:
    radial-gradient(circle at 14% -18%,rgba(255,255,255,.94) 0 6%,rgba(255,255,255,.44) 18%,transparent 44%),
    linear-gradient(118deg,rgba(255,255,255,.62) 0%,rgba(255,255,255,.28) 28%,rgba(239,228,209,.24) 63%,rgba(255,255,255,.46) 100%);
  --optical-glass-dark:
    radial-gradient(circle at 12% -18%,rgba(255,255,255,.15),transparent 35%),
    linear-gradient(138deg,#17314f 0%,#0e2138 48%,#091727 100%);
  --optical-edge:rgba(255,255,255,.64);
  --optical-shadow:0 18px 46px rgba(7,18,31,.13),0 5px 15px rgba(7,18,31,.05),inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(255,255,255,.14);
}

.ambient{
  filter:none!important;
  opacity:.20!important;
  background-size:100% 100%!important;
}
.ambient-a{background:radial-gradient(circle,rgba(211,173,103,.26) 0%,rgba(211,173,103,.10) 36%,transparent 70%)!important}
.ambient-b{background:radial-gradient(circle,rgba(65,101,145,.14) 0%,rgba(65,101,145,.06) 36%,transparent 72%)!important}

.site-header{
  background:var(--optical-glass-light)!important;
  border-color:var(--optical-edge)!important;
  box-shadow:0 20px 54px rgba(7,18,31,.14),inset 0 1px 0 rgba(255,255,255,.98),inset 0 -1px 0 rgba(255,255,255,.20)!important;
}
.site-header.is-scrolled{
  background:
    radial-gradient(circle at 15% -22%,rgba(255,255,255,.98),transparent 42%),
    linear-gradient(125deg,rgba(255,255,255,.72),rgba(240,229,210,.34) 68%,rgba(255,255,255,.60))!important;
}
.site-header:after{
  content:"";position:absolute;inset:2px;border-radius:inherit;pointer-events:none;
  background:linear-gradient(108deg,transparent 0 20%,rgba(255,255,255,.32) 30%,transparent 42% 100%);
  background-size:220% 100%;background-position:-120% 0;opacity:.55;
  animation:opticalHeaderSweep 8s ease-in-out infinite;
}
@keyframes opticalHeaderSweep{0%,76%{background-position:-120% 0}100%{background-position:160% 0}}

.menu-button,.header-consult,.hero-primary,.hero-secondary{
  background:
    radial-gradient(circle at 22% -12%,rgba(255,255,255,.95),transparent 42%),
    linear-gradient(135deg,rgba(255,255,255,.74),rgba(244,235,220,.38))!important;
  border-color:rgba(255,255,255,.74)!important;
  box-shadow:var(--optical-shadow)!important;
}
.hero-secondary{
  color:#fff!important;
  background:
    radial-gradient(circle at 18% -14%,rgba(255,255,255,.22),transparent 42%),
    linear-gradient(140deg,rgba(13,31,53,.86),rgba(8,20,35,.78))!important;
  border-color:rgba(255,255,255,.38)!important;
}

.menu-backdrop{background:rgba(4,12,22,.60)!important}
.site-menu{
  background:var(--optical-glass-dark)!important;
  border-color:rgba(255,255,255,.18)!important;
  box-shadow:0 32px 92px rgba(1,8,16,.38),inset 0 1px 0 rgba(255,255,255,.17),inset 0 -1px 0 rgba(255,255,255,.05)!important;
}
.menu-project-card,.menu-links a{
  background:
    radial-gradient(circle at 16% -14%,rgba(255,255,255,.16),transparent 42%),
    linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.035))!important;
}
.menu-refraction{opacity:.64!important}

.project-meta,.service-feature,.principles>div,.contact-form,.footer,.trust-item,.form-trust-note{
  background:
    radial-gradient(circle at 13% -18%,rgba(255,255,255,.94),transparent 42%),
    linear-gradient(145deg,rgba(255,255,255,.76),rgba(244,236,223,.50))!important;
  border-color:rgba(255,255,255,.82)!important;
  box-shadow:var(--optical-shadow)!important;
}

.project-dialog{background:#faf7f1!important}
.project-dialog::backdrop{background:rgba(3,10,18,.76)!important}
.reference-tile img,.dialog-media img{filter:saturate(.94) contrast(1.02)!important}

@media(max-width:900px){
  .site-header{
    background:
      radial-gradient(circle at 16% -22%,rgba(255,255,255,.96),transparent 43%),
      linear-gradient(125deg,rgba(255,255,255,.78),rgba(241,231,215,.46))!important;
  }
  .site-menu{
    background:
      radial-gradient(circle at 13% -16%,rgba(255,255,255,.13),transparent 34%),
      linear-gradient(145deg,#132b47,#0c1d31 58%,#081522)!important;
  }
  .ambient{display:none!important}
}

@media(prefers-reduced-motion:reduce){
  .site-header:after{animation:none!important;background-position:center!important}
}
'''
    safe.write_text(s)

offenders = []
patterns = [
    re.compile(r'backdrop-filter\s*:[^;{}]*blur\s*\(', re.I),
    re.compile(r'(?<!backdrop-)\bfilter\s*:[^;{}]*blur\s*\(', re.I),
    re.compile(r"filter\s*:\s*['\"]blur\s*\(", re.I),
]
for p in runtime:
    text = p.read_text()
    for pat in patterns:
        if pat.search(text):
            offenders.append(f'{p}: {pat.pattern}')
if offenders:
    raise SystemExit('Runtime blur remains:\n' + '\n'.join(offenders))

print(f'NO_BLUR_RUNTIME_GREEN files={len(runtime)}')
