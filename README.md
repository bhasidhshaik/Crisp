# AI-Powered Interview Assistant

### A Submission for the Swipe Internship Assignment (Crisp)

This is a full-stack, AI-powered web application designed to automate the initial technical screening process for candidates. It provides a seamless, timed interview experience for the interviewee and a powerful, organized dashboard for the interviewer.

**Live Demo:** [**https://your-live-url.vercel.app/**](https://your-live-url.vercel.app/)

---

![App Demo GIF](https://your-link-to-a-demo.gif)
*Note: You can create a GIF using free tools like [ScreenToGif](https://www.screentogif.com/) or [Kap](https://getkap.co/) to showcase your app's flow.*

## 🚀 Core Features

### 👨‍💻 For the Interviewee (Candidate)

* **Seamless Resume Upload:** Supports both `.pdf` and `.docx` formats with client-side parsing.
* **AI-Powered Info Extraction:** Automatically extracts the candidate's Name, Email, and Phone Number from the resume.
* **Interactive Chatbot:** If any details are missing, the chatbot intelligently prompts the user to provide them.
* **Dynamic AI Question Generation:** The interview questions are generated in real-time by the Google Gemini API, tailored for a Full-Stack role.
* **Timed, Multi-Difficulty Questions:** The interview consists of 6 questions (2 Easy, 2 Medium, 2 Hard) with strict timers (20s, 60s, 120s) to simulate a real-world test environment.
* **Forced Fullscreen Mode:** The interview automatically enters a distraction-free fullscreen mode to ensure the integrity of the assessment.
* **Instant Feedback:** Immediately after the interview, the AI provides a final score and a concise performance summary.
* **Session Persistence:** If the browser is refreshed or closed, the "Welcome Back" modal allows the user to seamlessly resume their interview.

### 👩‍💼 For the Interviewer (Hiring Manager)

* **Candidate Leaderboard:** A comprehensive dashboard listing all candidates, automatically ordered by score.
* **Interactive Triaging System:** A full drag-and-drop interface to move candidates from a "Pending" list into "Selected" or "Rejected" buckets.
* **Dynamic Row Coloring:** Candidates are color-coded based on their scores (Green for high, Yellow for average, Red for low) for at-a-glance evaluation.
* **Search and Sort:** Instantly search for candidates by name and sort the main list by score.
* **Detailed Candidate View:** Click on any candidate to open a detailed modal showing their profile, the final AI summary, and the full interview transcript.
* **Expandable Buckets:** The "Selected" and "Rejected" buckets can be expanded into a full-screen view for focused review.

## 🛠️ Tech Stack & Architecture

This project was built with a modern, robust, and scalable tech stack.

* **Framework:** React (with Vite)
* **UI Library:** Shadcn/ui & Tailwind CSS
* **State Management:** Redux Toolkit with `redux-persist` for local storage persistence.
* **AI Integration:** Google Gemini API via Vercel Serverless Functions.
* **Drag & Drop:** Native HTML Drag and Drop API for a lightweight and robust experience.
* **Deployment:** Vercel

### Key Architectural Decisions

* **Secure API Key Management:** All calls to the Gemini API are proxied through serverless functions running on Vercel. The secret API key is stored securely as an environment variable and is never exposed to the client-side, preventing unauthorized use.
* **Client-Side File Parsing:** To ensure maximum robustness and avoid server-side environment bugs (especially on Windows), resume files (`.pdf` and `.docx`) are parsed directly in the browser using `pdfjs-dist` and `mammoth.js`. Only the extracted text is sent to the backend, which is more efficient and reliable.
* **Centralized & Persistent State:** Redux Toolkit was chosen to manage the complex state of the interview and the list of candidates. `redux-persist` ensures a seamless user experience by saving all progress locally, allowing for features like session restoration.

## ⚙️ Running Locally

To get a local copy up and running, follow these simple steps.

**Prerequisites:**
* Node.js (v18 or later)
* npm
* A Vercel account (for the Vercel CLI)

**Installation:**

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Install the Vercel CLI:**
    ```sh
    npm install -g vercel
    ```

4.  **Set up your Environment Variables:**
    * Create a file named `.env.local` in the root of the project.
    * Add your Google Gemini API key to this file:
        ```env
        GEMINI_API_KEY=your_secret_api_key_here
        ```

5.  **Run the development server:**
    * This project uses the Vercel CLI for local development to properly handle the serverless functions in the `/api` directory.
    ```sh
    vercel dev
    ```
    The application will be available at `http://localhost:3000`.

## 📸 Screenshots