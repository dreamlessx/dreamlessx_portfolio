# the overzealous premed

> built different. studying different. mentoring different.

this is my personal mentorship and resume site for [Overzealous Premed](https://youtube.com/@theoverzealouspremed). i built this from scratch because i wanted something that actually looks good and does what i need it to do. mentorship bookings, my background, youtube content, contact form, all in one place.

not gonna lie, it came out clean. dark mode, responsive, smooth animations, the whole thing. if you're a premed and you found this repo somehow, go check out the actual site and subscribe to the channel.

## whats in here

| file | what it does |
|---|---|
| `index.html` | the whole site, single page with all sections |
| `styles.css` | dark theme, purple/pink gradients, fully responsive |
| `script.js` | scroll animations, mobile nav, stat counters |
| `favicon.svg` | custom "OP" favicon |

## sections

- **hero** . big headline, call to action buttons, animated stats
- **about** . who i am and why i started this
- **background** . education, experience, timeline layout, what i can help with
- **mentorship** . three tiers (quick chat, deep dive, full cycle) with pricing cards
- **youtube** . featured video area + cards linking to my channel
- **testimonials** . reviews section (placeholder for now, will update with real ones)
- **contact** . form with mentorship dropdown + all my socials
- **footer** . links and branding

## tech

pure HTML, CSS, and JavaScript. no frameworks. no dependencies. no npm. no 400mb node_modules folder. just code that works.

- zero dependencies, open `index.html` and it runs
- responsive on phone, tablet, desktop
- dark mode because thats the only mode
- scroll animations using intersection observer
- google fonts (Inter + Playfair Display)

## running it

```bash
# just open it
open index.html

# or serve it locally
python3 -m http.server 8000
```

thats it. no build step. no config. it just works.

## still need to do

- [ ] add my actual photo in the about section
- [ ] put in my real university name
- [ ] add my instagram / tiktok / twitter links
- [ ] replace placeholder testimonials with real ones
- [ ] hook up contact form to a backend (formspree or something)
- [ ] swap in real video thumbnails and titles
- [ ] finalize mentorship pricing

## deploying

static site so it works anywhere. github pages, netlify, vercel, literally any host.

## links

- youtube: [@theoverzealouspremed](https://youtube.com/@theoverzealouspremed)
- github: [@dreamlessx](https://github.com/dreamlessx)

if you're a premed reading this, go subscribe and book a session. lets get you into med school.
