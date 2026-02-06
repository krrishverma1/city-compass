

# Smart Tourist Itinerary Optimizer — Delhi

A real-time, adaptive travel concierge web app that generates intelligent, logistics-aware itineraries for tourists exploring Delhi.

---

## 1. Onboarding Screen — User Input Form

A clean, welcoming landing page with a modern card-based form collecting:

- **Current Location** — Text input with Google Maps Places autocomplete (e.g., "Connaught Place") plus a "Use My Location" GPS button
- **Current Time** — Auto-detected from device with option to override via time picker
- **Luggage Status** — Dropdown: "No Luggage", "Light Backpack", "Heavy Suitcase"
- **Interests** — Multi-select tag chips: History, Nature, Food, Adventure, Architecture, Shopping, Spiritual

A prominent "Generate My Itinerary" button launches the optimizer.

---

## 2. Delhi Location Database (Mock Data)

Pre-populated dataset of ~25-30 real Delhi landmarks and spots including:

- **Historical**: Red Fort, Humayun's Tomb, Qutub Minar, Purana Qila, Jantar Mantar
- **Spiritual**: Lotus Temple, Akshardham, Jama Masjid, Gurudwara Bangla Sahib
- **Nature/Scenic**: Lodhi Garden, India Gate lawns, Garden of Five Senses
- **Food**: Chandni Chowk food walk, Khan Market cafés, Dilli Haat
- **Shopping/Indoor**: Select Citywalk Mall, Dilli Haat, National Museum
- **Rooftop/Sunset spots**: Locations tagged for Golden Hour recommendations

Each location includes: name, coordinates, tags (indoor/outdoor/scenic/shaded), opening/closing hours, popularity score, a 2-sentence significance blurb, and a "best viewing tip."

---

## 3. Smart Logic Engine (Client-Side Processing)

All filtering and optimization runs in the browser — no backend needed. Applied in sequence:

**Step A — Luggage Filter:** If user has "Heavy Suitcase" and isn't at a hotel, the first stop is a nearby luggage storage facility or hotel cloak room. No sightseeing until resolved.

**Step B — Weather & Safety Filter:** Mocked weather/safety state with a toggle in the UI to simulate conditions:
- Rain/Storm → filters out outdoor spots, prioritizes museums, malls, indoor temples
- Safety Alert → triggers a full-screen "Red Alert" UI with emergency info and safety zones

**Step C — Time & Vibe Optimizer:**
- Golden Hour (5–6:30 PM) → prioritizes scenic viewpoints, India Gate, rooftop spots
- Midday Heat (12–3 PM) → prioritizes air-conditioned/shaded spots like museums and malls
- Closing Soon filter → removes places closing within 60 minutes

**Step D — Traffic & Proximity Filter:** Mocked traffic density data:
- Locations >40 min away due to "heavy traffic" get deprioritized (unless they're iconic must-see landmarks)
- Clustering: prioritizes attractions within a 2km radius to minimize transit time

**Step E — Crowd Optimization:** Mocked live crowd density (0–100 score):
- Attractions sorted by Popularity ÷ Current Crowd Density
- Goal: best experience at the least crowded moment

---

## 4. Itinerary Dashboard — Timeline View

A vertical timeline (similar to Google Maps timeline) showing the optimized route:

- **Time blocks** with clear start/end times and calculated transit time between stops
- **Dynamic badges** on each card:
  - 🌧️ "Rain Safe" — indoor recommendation during bad weather
  - 🚗 "Avoids Traffic" — nearby spot chosen over a farther one
  - 🌅 "Best View Now" — aligned with sunset/golden hour
  - 👥 "Low Crowd" — currently uncrowded
- **Route summary** at the top: total stops, estimated duration, total distance

---

## 5. Deep Dive — Location Detail Modal

Clicking any itinerary stop opens a detail modal with:

- **Significance** — 2-sentence summary of why this place matters
- **Best Viewing Spot** — A specific tip (e.g., "Head to the north lawn for the best photo of Red Fort at sunset")
- **Live Context Panel** — "Crowd: Low 🟢 | Traffic to here: 15 mins 🟢 | Weather: Clear ☀️"
- **Tags and badges** shown visually

---

## 6. Map Integration — Split View

- **Desktop**: Split-screen layout — timeline on the left, Google Map on the right showing numbered pins for each stop connected by a route line
- **Mobile**: Toggle button to switch between Timeline view and Map view
- Pins are numbered matching the itinerary order
- Clicking a pin highlights the corresponding timeline card and vice versa

*Note: Google Maps integration requires a Maps JavaScript API key which you'll provide.*

---

## 7. Simulation Controls

A collapsible "Simulator" panel (for demo purposes) allowing you to toggle:

- Weather condition (Clear / Rain / Storm)
- Safety alert (On / Off)
- Traffic density (Light / Moderate / Heavy)
- Crowd levels (Low / Medium / High)
- Time override

Changing any toggle instantly re-generates the itinerary so you can demo the smart logic in action.

---

## 8. Design & UI Style

- **Theme**: Clean whites with accent blues and greens — travel-focused, minimalist
- **Typography**: Modern sans-serif, clear hierarchy
- **Icons**: Lucide React throughout
- **Responsive**: Fully responsive — desktop split-screen, mobile stacked/toggle layout
- **Animations**: Smooth transitions when itinerary regenerates, subtle card entrance animations

