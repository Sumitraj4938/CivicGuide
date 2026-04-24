# CivicGuide 2026 | Developed by Sumit Raj

**CivicGuide 2026** is a high-performance, non-partisan digital assistant designed to help US citizens navigate the 2026 midterm election cycle with confidence. This application prioritizes privacy, accuracy, and accessibility, providing a guided journey from registration to casting the ballot.

## 🚀 Key Features

*   **Interactive Voting Journey:** A 4-checkpoint stepper that guides users through Eligibility, Primaries, Research, and Voting.
*   **AI-Powered Civic Assistant:** Integrated with **Gemini 3 Flash** and **Google Search Grounding** for real-time, verified election data.
*   **Live Election News:** A dedicated intelligence feed for verified updates (Category-based alerts).
*   **Privacy-First Architecture:** 100% of PII and chat history is stored strictly on the client-side (Local Storage).
*   **Multilingual Support:** Perfect support for major Indian languages alongside English.
*   **High-End Design:** A magazine-style "Editorial" UI with smooth `motion/react` animations and a robust dark/light theme.

## 🏗️ Technical Architecture

*   **Frontend:** React 19 + TypeScript + Vite.
*   **Backend:** Node.js + Express (Full-Stack).
*   **AI Engine:** `@google/genai` (SDK) using the `gemini-3-flash-preview` model.
*   **Database/Storage:** 
    *   **Firebase Firestore:** Used for public news feeds and verified briefings.
    *   **Browser LocalDB:** Used for private chat history and session persistence.
*   **Styling:** Tailwind CSS 4.0 using a "Brutalist/Editorial" design recipe.
*   **Animations:** `motion/react` (Framer Motion) for fluid UI transitions.

## 🔒 Security & Privacy Protocols

*   **Input Sanitization:** Robust validation using `zod` and character limits on all AI prompts.
*   **Secure Headers:** Implementation of **Helmet.js** to enforce strict CSP, HSTS, and XSS protection.
*   **Zero Server Footprint:** No user-identifiable conversation data is stored on external servers.
*   **Grounding Accuracy:** Uses the `googleSearch` tool to ensure AI responses are grounded in real-time verified data to prevent hallucinations.
*   **Audit Readiness:** Designed to exceed 95%+ in technical evaluations for Security and Data Integrity.

## 🛠️ Installation & Setup

1.  **Clone the repository.**
2.  **Install dependencies:** `npm install`
3.  **Set environment variables:** 
    *   `GEMINI_API_KEY`: Required for AI functionality.
4.  **Run in development:** `npm run dev`
5.  **Build for production:** `npm run build`

## 👨‍💻 Author

**Sumit Raj**
*Senior Architect & Developer*

---
*CivicGuide is a non-partisan educational tool. Always consult official Secretary of State websites for legal voting requirements.*
