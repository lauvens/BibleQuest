# BibleQuest - Light Mode Colors

## Base Colors (from tailwind.config.ts)

### Primary (Brun chaud - Brown)
| Token | Hex | Usage |
|-------|-----|-------|
| primary-50 | `#faf6f3` | Hover backgrounds |
| primary-100 | `#f3ebe4` | Icon backgrounds, avatar backgrounds |
| primary-200 | `#e6d5c7` | Borders |
| primary-300 | `#d4b8a3` | Borders, outlines |
| primary-400 | `#c19a7f` | Placeholder text, secondary icons |
| primary-500 | `#a67c5b` | Secondary buttons, accents |
| primary-600 | `#8b6344` | Text, icons |
| primary-700 | `#6f4e36` | Text |
| primary-800 | `#5a3f2d` | Headings, strong text |
| primary-900 | `#4a3426` | Main body text |

### Parchment (Beige - Background)
| Token | Hex | Usage |
|-------|-----|-------|
| parchment-50 | `#fefdfb` | Card backgrounds |
| parchment-100 | `#fdf9f3` | Page background |
| parchment-200 | `#faf3e8` | Hover states, stat cards |
| parchment-300 | `#f5e9d6` | Borders, dividers |
| parchment-400 | `#eddcc0` | - |
| parchment-500 | `#e3cca6` | - |

### Gold (Or - Rewards)
| Token | Hex | Usage |
|-------|-----|-------|
| gold-100 | `#fff9e6` | Badge backgrounds, streak backgrounds |
| gold-200 | `#fff0c2` | - |
| gold-300 | `#ffe599` | Selection highlight |
| gold-400 | `#ffd966` | Gradient start |
| gold-500 | `#f5c32c` | Main gold, streak icon |
| gold-600 | `#d4a520` | Text on gold backgrounds |
| gold-700 | `#b38918` | - |
| gold-800 | `#8f6d14` | Text |

### Olive (Vert - CTA/Success)
| Token | Hex | Usage |
|-------|-----|-------|
| olive-50 | `#f7f9f4` | Active nav background |
| olive-100 | `#ecf2e5` | XP icon background |
| olive-400 | `#9db87c` | Gradient |
| olive-500 | `#7a9a55` | Primary buttons, CTA |
| olive-600 | `#5f7b40` | Active nav text, links |
| olive-700 | `#4a6133` | Button hover |

### Error (Rouge)
| Token | Hex | Usage |
|-------|-----|-------|
| error-50 | `#fef7f6` | Error message backgrounds |
| error-100 | `#fdecea` | Heart icon backgrounds |
| error-200 | `#fbd5d1` | Error borders |
| error-500 | `#e25d4e` | Hearts, error text, danger buttons |
| error-600 | `#c94535` | Danger button hover |
| error-700 | `#a83a2c` | Error text strong |

### Info (Bleu - Gems)
| Token | Hex | Usage |
|-------|-----|-------|
| info-100 | `#e0f2fe` | Gem backgrounds |
| info-200 | `#bae6fd` | Gem borders |
| info-500 | `#0ea5e9` | Gem icons |
| info-700 | `#0369a1` | Gem text |

### Success (Vert)
| Token | Hex | Usage |
|-------|-----|-------|
| success-100 | `#dcfce7` | Success badge backgrounds |
| success-200 | `#bbf7d0` | Completed lesson backgrounds |
| success-300 | `#86efac` | Success borders |
| success-600 | `#16a34a` | Checkmarks |
| success-700 | `#15803d` | Success text |

---

## Specific UI Elements

### Backgrounds
| Element | Light Color |
|---------|-------------|
| Page background | `parchment-100` (#fdf9f3) |
| Card background | `parchment-50` (#fefdfb) |
| Navbar background | `parchment-50/95` (with blur) |
| Input background | `parchment-50` (#fefdfb) |
| Stat card background | `parchment-100` (#fdf9f3) |

### Text
| Element | Light Color |
|---------|-------------|
| Headings (h1, h2) | `primary-800` (#5a3f2d) |
| Body text | `primary-900` (#4a3426) |
| Secondary text | `primary-500` (#a67c5b) |
| Muted text | `primary-400` (#c19a7f) |
| Links | `olive-600` (#5f7b40) |

### Borders
| Element | Light Color |
|---------|-------------|
| Default border | `primary-200` (#e6d5c7) |
| Card border | `parchment-300` (#f5e9d6) |
| Input border | `parchment-300` (#f5e9d6) |
| Input focus border | `olive-400` (#9db87c) |

### Buttons
| Variant | Background | Text |
|---------|------------|------|
| Primary | `olive-500` (#7a9a55) | white |
| Secondary | `primary-500` (#a67c5b) | white |
| Outline | transparent | `primary-600` (#8b6344) |
| Ghost | transparent | `primary-600` (#8b6344) |
| Gold | gradient gold-400 to gold-500 | `primary-900` |
| Danger | `error-500` (#e25d4e) | white |

### Icons
| Type | Light Color |
|------|-------------|
| Hearts filled | `error-500` (#e25d4e) |
| Hearts empty | `parchment-300` (#f5e9d6) |
| Streak (active) | `gold-500` (#f5c32c) |
| Streak (inactive) | `primary-400` (#c19a7f) |
| XP/Level | `olive-600` (#5f7b40) |
| Gems | `info-500` (#0ea5e9) |
| Coins | `gold-600` (#d4a520) |

### Special Elements
| Element | Light Color |
|---------|-------------|
| Progress bar track | `parchment-300` (#f5e9d6) |
| XP progress fill | gradient `olive-400` to `olive-500` |
| Gold progress fill | gradient `gold-400` to `gold-500` |
| Scrollbar track | `parchment-200` (#faf3e8) |
| Scrollbar thumb | `primary-300` (#d4b8a3) |
| Selection | `gold-300` (#ffe599) bg + `primary-900` text |

---

# BibleQuest – Dark Mode Colors

## Base Colors (Dark Mode Tokens)

### Primary (Brun chaud – Dark)
| Token | Hex | Usage |
|------|-----|-------|
| primary-900 | #2b1f17 | Page background |
| primary-850 | #33251b | Stat card background |
| primary-800 | #3a2a1f | Card / input background |
| primary-700 | #6f4e36 | Borders, dividers |
| primary-600 | #8b6344 | Secondary UI |
| primary-500 | #a67c5b | Inactive icons |
| primary-300 | #d4b8a3 | Secondary text |
| primary-200 | #e6d5c7 | Outline / ghost text |

### Parchment (Inversé – Texte)
| Token | Hex | Usage |
|------|-----|-------|
| parchment-50 | #fefdfb | Headings |
| parchment-100 | #fdf9f3 | Body text |

### Gold (Or – Rewards)
| Token | Hex | Usage |
|------|-----|-------|
| gold-400 | #ffd966 | Accent |
| gold-500 | #f5c32c | Streak, progress |
| gold-600 | #d4a520 | Gold text |

### Olive (CTA / Success)
| Token | Hex | Usage |
|------|-----|-------|
| olive-400 | #9db87c | Links, XP |
| olive-500 | #7a9a55 | CTA |
| olive-600 | #5f7b40 | Primary buttons |

### Error
| Token | Hex | Usage |
|------|-----|-------|
| error-500 | #e25d4e | Errors |
| error-600 | #c94535 | Danger hover |

### Info
| Token | Hex | Usage |
|------|-----|-------|
| info-400 | #38bdf8 | Gems |
| info-500 | #0ea5e9 | Icons |

---

## Backgrounds
| Element | Dark Color |
|------|-----------|
| Page background | primary-900 |
| Card background | primary-800 |
| Navbar background | primary-900/90 + blur |
| Input background | primary-800 |
| Stat card background | primary-850 |

## Text
| Element | Dark Color |
|------|-----------|
| Headings | parchment-50 |
| Body text | parchment-100 |
| Secondary text | primary-300 |
| Muted text | primary-400 |
| Links | olive-400 |

## Borders
| Element | Dark Color |
|------|-----------|
| Default border | primary-700 |
| Card border | primary-800 |
| Input border | primary-700 |
| Input focus | olive-500 |

## Buttons
| Variant | Background | Text |
|------|-----------|------|
| Primary | olive-600 | parchment-50 |
| Secondary | primary-600 | parchment-50 |
| Outline | transparent + primary-600 | primary-200 |
| Ghost | transparent | primary-200 |
| Gold | gradient gold-500 → gold-600 | primary-900 |
| Danger | error-600 | white |

## Icons
| Type | Dark Color |
|------|-----------|
| Hearts filled | error-500 |
| Hearts empty | primary-700 |
| Streak active | gold-500 |
| Streak inactive | primary-500 |
| XP / Level | olive-400 |
| Gems | info-400 |
| Coins | gold-400 |

## Special Elements
| Element | Dark Color |
|------|-----------|
| Progress bar track | primary-700 |
| XP progress fill | olive-500 → olive-400 |
| Gold progress fill | gold-500 → gold-400 |
| Scrollbar track | primary-800 |
| Scrollbar thumb | primary-600 |
| Selection | gold-500 bg + primary-900 text |