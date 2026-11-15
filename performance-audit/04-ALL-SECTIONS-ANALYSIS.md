# Complete section inventory

The actual page contains Navbar, Hero, About, My Interests, a tabbed Portfolio Showcase, Contact/Visitor Wall and Footer, plus a global background. Skills is both a compact About subsection and a Tech Stack tab; it is not a separate full-page route. Certificates and Experience are tabs, Music is an Interests subsection, and Lanyard is inside Hero. This index separates them for independent engineering review without inventing top-level sections.

| Report | Actual role |
|---|---|
| [Navbar](sections/01-navbar.md) | Top-level navigation |
| [Hero introduction and actions](sections/02-hero.md) | Top-level section |
| [Interactive 3D Lanyard](sections/03-lanyard.md) | Hero subcomponent |
| [About and ProfileCard](sections/04-about.md) | Top-level section |
| [Compact About skills](sections/05-compact-skills.md) | About subsection |
| [My Interests and HalftonePortrait](sections/06-interests.md) | Top-level section |
| [Music playlist](sections/07-music-playlist.md) | Interests subsection |
| [Projects and showcase shell](sections/08-projects-showcase.md) | Top-level section / default tab |
| [Certificates](sections/09-certificates.md) | Showcase tab |
| [Experience](sections/10-experience.md) | Showcase tab |
| [Development Toolkit / Tech Stack](sections/11-development-toolkit.md) | Showcase tab, #skills destination |
| [Contact and private-message form](sections/12-contact.md) | Top-level section |
| [Visitor Wall and public composer](sections/13-visitor-wall.md) | Contact subsection |
| [Footer](sections/14-footer.md) | Top-level footer |
| [Global GlowCursor and shared visual effects](sections/15-global-effects.md) | Cross-section system |

## Navigation and ordering

`main#home` wraps Hero → `#about` → `#interests` → `#projects` (including `#skills`) → `#contact`; Footer is outside main. App navigation follows this order except Skills is reachable through the tab/hash. Mobile CSS puts the Lanyard before Hero copy. Certificates and Experience unmount when another showcase tab is selected.

## Coverage and limits

Every listed report addresses purpose, exact source, technology, initialization, loading, rendering, animation, requests, measured/unknown costs, readiness, problems, fixes, risks and recommendation. Individual CPU/GPU costs were not isolated for each small subsection; those reports explicitly say so instead of allocating the page total. Functional screenshots establish rendered layouts, not precise first-interactive timing for each region. Preview Contact and blocked third-party media are kept distinct from the inaccessible live site.
