# DevOps AI Interview Coach 🚀

> An intelligent, production-grade mock interview platform designed to help candidates prepare for DevOps, SRE, and Cloud Platform engineering interviews through realistic AI simulations, live incident troubleshooting, and personalized feedback.

---

## ✨ Features

- **Autonomous AI Interviewer (Alex)**: Explains the format, asks tailored questions one by one, accepts typed or speech-dictated answers, and provides adaptive follow-up questions.
- **10-Point Technical Scorecard**: Evaluates answers with:
  - Overall score out of 10
  - Technical correctness, clarity, and troubleshooting sub-scores
  - What you answered well (green checkmarks)
  - Missing technical points
  - Concrete areas to improve
  - Suggested human-readable ideal answer
  - Copyable practical CLI command or configuration snippet
- **14 DevOps Engineering Domains**:
  1. Linux Administration (permissions, processes, logs, disk usage, memory, networking)
  2. AWS Cloud Infrastructure (EC2, S3, IAM, VPC, subnets, security groups, ALB, Auto Scaling)
  3. Git & Version Control (branching, merging, PRs, conflicts, interactive rebase)
  4. Jenkins & CI/CD Pipelines (Jenkinsfiles, stages, agents, webhooks, canary/blue-green)
  5. Docker & Containerization (Dockerfiles, multi-stage builds, cgroups, namespaces)
  6. Kubernetes Orchestration (Pods, Deployments, Services, probes, CrashLoopBackOff)
  7. Terraform & IaC (state locking, remote backends, modules, drift detection)
  8. Ansible Configuration Management (playbooks, idempotency, roles, dynamic inventories)
  9. DevOps & Cloud Networking (DNS, TCP, NAT Gateways, SSL/TLS)
  10. Bash Scripting (strict mode `set -euo pipefail`, exit codes, pipes)
  11. Python for DevOps (Boto3 AWS automation, REST APIs)
  12. Prometheus & Grafana (PromQL, Alertmanager, multi-window burn rates)
  13. Production Troubleshooting (502s, OOM kills, slow queries, thread exhaustion)
  14. SRE, SLIs, SLOs & Incident Management (error budgets, MTTR, blameless post-mortems)
- **Interactive Production Incident Simulator**:
  - Live incident drills for P1 outages (502 Bad Gateway after deployment, Kubernetes Pod CrashLoopBackOff Exit Code 137, EC2 SSH Connection timed out, 100% CPU Database runaway, Terraform State Lock acquisition failure).
  - Step-by-step triage commands, telemetry, and SRE incident commander evaluation.
- **Voice Text-to-Speech & Speech Recognition**:
  - Gemini TTS (`gemini-3.8-flash-lite-tts`) and browser Web Speech API for spoken question audio.
  - Microphone speech-to-text dictation.
- **Personalized 7-Day Study Roadmap**:
  - Actionable daily study plans with specific commands, focus areas, and tasks to resolve weak points.
- **Zero-Key Demo & Offline Fallback**:
  - Includes a curated question bank and intelligent heuristic grading rules that work seamlessly without an external API key.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Lucide React, Motion, Canvas-Confetti.
- **Backend**: Node.js, Express, `tsx`.
- **AI Integration**: Google Gemini API via official `@google/genai` TypeScript SDK:
  - Evaluation & Generation: `gemini-3.8-flash`
  - Voice Speech Synthesis: `gemini-3.8-flash-lite-tts`
- **Containerization & Deployment**: Docker multi-stage build, Google Cloud Run ready.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js (version 20 or 22+)
- npm or yarn

### 2. Installation
```bash
git clone <repo-url>
cd devops-ai-interview-coach
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your Gemini API key (optional for demo mode):
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
PORT=3000
```
> Note: If `GEMINI_API_KEY` is not provided, the application automatically activates **Offline Demo Mode**, utilizing the built-in curated DevOps question bank and heuristic evaluator.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

- **Lint & TypeScript Validation**:
  ```bash
  npm run lint
  ```
- **Production Build Test**:
  ```bash
  npm run build
  ```

---

## 🚢 Production Deployment

### Docker Deployment
Build the production Docker image:
```bash
docker build -t devops-coach:latest .
```

Run the container:
```bash
docker run -p 3000:3000 -e GEMINI_API_KEY="YOUR_KEY" devops-coach:latest
```

### Deploy to Google Cloud Run
```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build and deploy directly to Cloud Run
gcloud run deploy devops-coach \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="YOUR_KEY" \
  --port 3000
```

---

## 🔒 Security & Privacy

- All Gemini API calls execute exclusively on the server side (`server.ts`).
- No API keys or authentication credentials are exposed to the client bundle.
- Audio speech dictation processes client-side without storing personal audio files.
- Disclaimer: AI-generated evaluations and scores are diagnostic indicators to assist in preparation, not official recruitment or hiring commitments.

---

## 📄 License
Apache-2.0
