# CivicLens — AI Civic Operating System & Constituency Development Planning Platform

![CivicLens Banner](https://via.placeholder.com/1200x400/0b1326/8083ff?text=CivicLens+AI+OS+%26+Constituency+Development+Planning)

> **"People's Priorities: AI for Constituency Development Planning"**
> 
> CivicLens is an enterprise-grade municipal operating system and constituency development planning platform. Built for Indian urban local bodies—specifically demonstrated for the **Bhubaneswar Municipal Corporation (BMC)**—it bridges the gap between raw citizen voices, field operations, and high-level capital expenditure governance.

---

## 🌟 Key Capabilities

### 1. 🚀 Immersive 3D Landing Experience
- **Interactive 3D Web Environment**: A breathtaking landing page built with `react-three-fiber` and `framer-motion`, featuring floating 3D infrastructure models, dynamic lighting, and scroll-driven camera animations.

### 2. 📱 Native Hybrid Android App
- **Kotlin-Based WebView Container**: A custom native Android application that bridges hardware capabilities (Camera, Mic, GPS) directly with the responsive React Web App over the local network.
- **Role-Based Navigation**: Native dashboard UI with instant deep-linking into Citizen Profile, Worker Dashboard, Map Planning, and Emergency SOS.

### 3. 🏛 Citizen Voice & Operations Platform
- **Natural-Language Voice & Text Reporting (Offline AI)**: Powered by a completely offline browser-based Whisper model (`@xenova/transformers`) and Gemini. Speak your issue naturally; on-device AI transcribes, classifies, geolocates, and automatically routes reports for complete privacy.
- **Emergency Voice Routing**: Crucial keywords (e.g., "fire", "accident") detected by the offline Whisper model trigger instantaneous SOS dispatch to the nearest Operator and Worker Teams.
- **Dynamic Real-Time Hotspot Marking**: Reporting an issue triggers instantaneous demand normalization, theme clustering, and dynamic recomputation of GIS demand hotspots with a strict **100-meter radius** reflected live without page reload.
- **e-Aadhaar KYC Citizen Registration**: First-time citizens can verify their identity using UIDAI-compliant digitally signed e-Aadhaar PDFs, deriving passcodes (`FIRST4NAME + YYYY`) and claiming a +100 Civic Points welcome grant.
- **Direct Database Seeding (Zero Frontend Mock Data)**: Central municipal services, Bhubaneswar civic rewards, user timeline activities, and notifications are directly seeded into SQLite (`civiclens.db`) and served via REST APIs.
- **Dynamic Issue Tracking**: Interactive lifecycle tracker from submission through technician assignment, in-progress repairs, and verified resolution.
- **Interactive Multi-Layer Leaflet GIS**: Real-time spatial dashboard toggling between:
  - Active Civic Incidents
  - Normalized Development Demands
  - Geospatial Demand Hotspots (pulsing 100m intensity circles)
  - Infrastructure Amenities & Baselines
  - Capital Works Proposals & Approved Portfolios
- **Hierarchical Workforce Management**: Distinguishes between `Field Worker` and `Department Head` roles. Department Heads receive full overview for their specific category (e.g. Fire, Transit) and can easily filter through All/Active/Resolved jobs.
- **Emergency Crisis Center**: High-visibility crisis command center for dispatching emergency responders and broadcasting citywide alerts.

---

### 4. 🧠 Constituency Development Planning Intelligence
CivicLens transforms uncoordinated citizen complaints into auditable, data-backed capital improvement portfolios:

```
Citizen Voice / Text Input
    ↓
AI Normalization Pipeline (Category, Subcategory, Severity, Urgency, Affected Demographics)
    ↓
Structured Civic Demands (Persistent SQLite Schema)
    ↓
Demand Themes & Recurrence Tracking (Coherence scoring & citizen reach)
    ↓
Geographic Hotspots (Spatial density & intensity calculations)
    ↓
Public Data & Evidence Fusion (Bhubaneswar Census 2011, BMC Slum Surveys, OSM)
    ↓
Development Proposals (8 BMC Wards: Drainage, Healthcare, Water, Roads, Solar, Waste)
    ↓
Deterministic 11-Factor Priority Engine (Transparent 0–100 mathematical scoring)
    ↓
Multi-Scenario Impact Assessment (Conservative, Base, Optimistic models)
    ↓
Constraint-Aware Portfolio Optimization (₹5.0 Cr budget slider & exclusion rationales)
    ↓
Authority Decision Studio (Human review, override tracking with mandatory justification)
    ↓
Permanent DecisionRecord Audit Trail (Cryptographically tamper-evident log)
```

---

## 📊 Development Planning Studio (`/admin/planning`)

Located inside the Operator Portal, the Development Planning Studio provides municipal commissioners and urban planners with a 9-tab intelligence suite:

| Module | Purpose & Features |
| :--- | :--- |
| **Demand Intelligence** | Real-time stream of normalized citizen inputs with confidence scores, severity ratings, and target groups. Includes an interactive live prompt simulator. |
| **Themes & Recurrence** | Clusters individual demands into recurring civic themes with coherence scores and unique citizen reach metrics. |
| **Demand Hotspots** | Spatial clustering identifying high-concentration wards with intensity calculations and dominant civic categories. |
| **Public Data & Evidence** | Official registry for Bhubaneswar Census 2011 demographics, BMC Slum Housing records, and OSM infrastructure. Supports deep-dive evidence inspection (`SUPPORTING`, `CONTRADICTING`, `NEUTRAL`, `INSUFFICIENT_DATA`). |
| **Proposals** | Catalog of structured capital works proposals with budget, timeline, target ward, beneficiaries, and dependencies. |
| **Priority Engine** | Full mathematical breakdown of the 11 deterministic factors and weights contributing to each proposal's priority score. |
| **Impact Assessment** | 3-scenario forecasting (Conservative / Base / Optimistic) with declared assumptions and uncertainty levels. |
| **Portfolio Optimizer** | Interactive constraint planner with a ₹5.0 Cr budget slider, real-time value/cost optimization, and auditable exclusion rationales. |
| **Decision Studio** | Final authority governance interface allowing approvals, overrides with mandatory justifications, and a permanent history of `DecisionRecord` entries. |

---

## 📐 Deterministic 11-Factor Priority Engine

To ensure algorithmic fairness and eliminate LLM hallucinations in capital allocation, priority scores are calculated using a deterministic, reproducible formula:

$$\text{Priority Score} = \sum_{i=1}^{11} w_i \times \text{normalized\_factor}_i$$

```
FACTOR BREAKDOWN (Example: Ward 23 Stormwater Drainage — Total: 87.4 / 100)
├── Demand Strength           (w = 0.16) : 95.0% -> +15.20 pts
├── Unique Citizen Reach      (w = 0.14) : 90.0% -> +12.60 pts
├── Recurrence Status         (w = 0.12) : 100.0% -> +12.00 pts
├── Geographic Concentration  (w = 0.10) : 90.0% -> +9.00 pts
├── Contextual Evidence       (w = 0.10) : 88.0% -> +8.80 pts
├── Infrastructure Gap        (w = 0.10) : 85.0% -> +8.50 pts
├── Urgency Level             (w = 0.08) : 90.0% -> +7.20 pts
├── Problem Severity          (w = 0.06) : 80.0% -> +4.80 pts
├── Affected Population       (w = 0.05) : 74.0% -> +3.70 pts
├── Equity & Vulnerability    (w = 0.05) : 82.0% -> +4.10 pts
└── Evidence Confidence       (w = 0.04) : 92.0% -> +3.68 pts
```

Every score includes a human-readable explanation derived directly from the mathematical contributions.

---

## 📈 Constraint-Aware Portfolio Optimization

The Portfolio Optimizer solves the 0-1 Knapsack problem using an exact Branch-and-Bound algorithm maximizing composite citizen value under real-world municipal constraints:

- **Configurable Budget**: Dynamic budget limit (e.g., ₹5.00 Cr to ₹20.00 Cr).
- **Exact Optimization**: Branch-and-Bound solver explores the combinatorial space to find the global optimum combination of projects maximizing composite value under hard fiscal envelopes.
- **Auditable Exclusion Rationales**: For every proposal excluded, the engine explicitly logs deterministic reasons (e.g., `Exceeds remaining available budget of ₹X Cr`, `Category allocation cap reached`, `Prerequisite dependencies not selected`).
- **Human-in-the-Loop Governance**: Administrators can override recommended selections, but the system **strictly mandates an auditable justification of ≥15 characters** for every override before creating the immutable `DecisionRecord`.

---

## 🏛 Authentic Bhubaneswar Datasets & Evidence Fusion

CivicLens adheres to a strict **truthfulness standard**:
- **Ingested Datasets**:
  - `City_Profile_Bhubaneswar_1_0 (1).csv`: Official ward-level Census 2011 demographics (Total Population, Male/Female, SC/ST, Households, Literates).
  - `Slum_Housing_Bhubaneswar_1.csv`: BMC slum surveys detailing slum counts, slum populations, and infrastructure access per ward.
  - `wards.geojson` & `osm-amenities.geojson`: Accurate boundary geometries and verified public amenities for Bhubaneswar.
- **Evidence Verification**: Each proposal cites authentic ground-truth records. Zero fabricated baselines or synthetic thresholds. Where specific field readings are absent, the system explicitly marks the evidence as `INSUFFICIENT_DATA` with `confidence: 0.0`.

---

## 🏗 Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Vanilla CSS custom properties.
- **Native Mobile**: Kotlin, Android Studio, WebViews.
- **3D Render Engine**: Three.js, React Three Fiber, React Three Drei.
- **Data Visualizations & GIS**: Recharts, Leaflet + React-Leaflet (OpenStreetMap).
- **AI Core**: Google Gemini Generative AI SDK (`gemini-3.5-flash` with cascading fallback to `gemini-2.5-flash`) and Xenova Transformers (on-device local offline Whisper model).
- **Backend Server**: Node.js, Express, RESTful JSON API.
- **Database**: SQLite with `better-sqlite3` (WAL mode enabled, foreign keys enforced).

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Google Gemini API Key (optional; offline mock mode included)

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional)
echo VITE_GEMINI_API_KEY=your_gemini_api_key_here > .env

# 3. Start development server
npm run dev
```

- **Frontend**: `http://localhost:5173` (exposed on Network via `0.0.0.0` for Native App access)
- **Backend API**: `http://localhost:3000` (bound to `0.0.0.0` to permit remote physical device queries)

### Running on Physical Android Device
1. Find your computer's local IP address (e.g. `192.168.1.5`).
2. Update the IP address inside `src/services/api.ts` (`VITE_API_URL`) and `android_app/.../MainActivity.kt` (`BASE_URL`).
3. Connect your Android device via USB and ensure it's on the same WiFi network.
4. Open the `android_app/` folder in Android Studio and hit **Run**.

---

## 🛡 Accessibility & Design Integrity

- **WCAG AA Compliant**: High-contrast mode, dynamic text scaling, and reduced motion toggles.
- **Zero Flash Theme Engine**: Synchronous initialization for Light, Dark, and System modes.
- **Responsive Layout**: Seamless experience across mobile tablets, laptops, and 4K command displays.

---

## 👨‍💻 Author & Architecture
**Abhinav Kumar**  
*Lead Architect & Full-Stack Developer*  
- **Email**: [itsabhinav36@gmail.com](mailto:itsabhinav36@gmail.com)  
- **LinkedIn**: [Abhinav Kumar](https://www.linkedin.com/in/abhinav-kumar-b4b993382/)  
- **GitHub**: [AbhinavKumar36](https://github.com/AbhinavKumar36)
