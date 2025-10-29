# Model Router Demo Application

A full-stack web application demonstrating Azure AI Foundry's model router capabilities with React frontend and Python FastAPI backend.

## Hosted demo

A hosted version of the demo is available at [https://aka.ms/model-router-demo](https://aka.ms/model-router-demo). However, uptime is not guaranteed. This demo will be supported until 31/12/2025, potentially beyond.

## Quick Start (Offline Mode - Recommended for Demos)

The easiest way to run this application is in **offline/replay mode**, which requires no backend setup or API keys. This mode replays pre-recorded responses, making it perfect for demonstrations and testing the UI.

### Prerequisites

- Node.js (v16+)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd aitour26-LTG153-automate-model-selection-and-ai-app-design-with-azure-ai-foundry/src
   ```

2. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   ```

3. **Start the frontend**
   ```bash
   npm run dev
   ```

4. **Enable Offline Mode**
   - Open the application at http://localhost:5173
   - Navigate to **Settings** in the sidebar
   - Toggle **Offline Mode (Replay)** to ON

**That's it!** The application now runs entirely in the browser with simulated responses, latencies, and costs from previous runs. No backend or API keys required.

### What Works in Offline Mode

- ✅ Model Router comparison with realistic streaming responses
- ✅ Dataset evaluation with pre-recorded results
- ✅ Zava Sportswear chatbot demo
- ✅ Simulated latencies and token costs
- ✅ All UI interactions and features
- ❌ File uploads (uses sample data instead)
- ❌ Real-time API calls

---

## Live Mode (Optional - For Production Use)

If you want to connect to real Azure AI services and make live API calls, follow these additional steps.

### Additional Prerequisites

- Python 3.12+
- Visual Studio Code (recommended)
- Azure subscription with Azure AI Foundry access

### Getting Azure AI Foundry API Keys

To use live Azure OpenAI models, you'll need to obtain API keys from Azure AI Foundry:

1. **Navigate to Azure AI Foundry**
   - Go to [https://ai.azure.com](https://ai.azure.com)
   - Sign in with your Azure account

2. **Create or Select a Project**
   - Create a new project or select an existing one
   - Navigate to your project hub

3. **Deploy Models**
   - Go to the **Deployments** section in the left sidebar
   - Click **+ Create deployment** (or **+ Deploy model**)
   - Select the model you want to deploy (e.g., GPT-4, GPT-3.5-turbo)
   - Give your deployment a name (e.g., `model-router` or `gpt-4`)
   - Click **Deploy**
   - **Repeat this process** to deploy a second model for benchmarking

4. **Get Your API Keys and Endpoint**
   - After deployment, click on your deployment name
   - Navigate to the **Keys and Endpoint** section (or click **View code** and find the connection details)
   - Copy the following information for **each deployment**:
     - **Endpoint**: Your Azure OpenAI endpoint URL (e.g., `https://<your-resource>.cognitiveservices.azure.com/`)
     - **API Key**: One of the provided keys (Key 1 or Key 2)
     - **API Version**: The API version (e.g., `2024-05-01-preview`)
     - **Deployment Name**: The name you gave to your deployment

### Backend Setup

1. **Set up the backend**
   ```bash
   cd backend  # If you're already in the src directory from Quick Start
   # Or from repo root: cd src/backend
   python -m venv .venv
   # To use a specific Python version:
   # python3.12 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   ```

2. **Configure backend environment variables**
   - Open `backend/.env` in your editor
   - Set `AUTH=false` for local development
   - Update the Azure OpenAI credentials with values from Azure AI Foundry:
     ```
     AZURE_OPENAI_ENDPOINT="https://<your-resource>.cognitiveservices.azure.com/"
     AZURE_OPENAI_API_KEY="<your-api-key>"
     AZURE_OPENAI_API_VERSION="2024-05-01-preview"
     AZURE_OPENAI_DEPLOYMENT_NAME="<your-deployment-name>"
     ```
   - **Important**: You must also configure the benchmark model credentials:
     ```
     AZURE_OPENAI_BENCHMARK_ENDPOINT="https://<your-benchmark-resource>.cognitiveservices.azure.com/"
     AZURE_OPENAI_BENCHMARK_API_KEY="<your-benchmark-api-key>"
     AZURE_OPENAI_BENCHMARK_API_VERSION="2024-05-01-preview"
     AZURE_OPENAI_BENCHMARK_DEPLOYMENT_NAME="<your-benchmark-deployment-name>"
     ```

### Running in Live Mode

1. **Start the backend** (in terminal 1):
   ```bash
   # From repo root:
   cd src/backend
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   python -m uvicorn app:app --reload --port 8000
   ```

2. **Start the frontend** (in terminal 2):
   ```bash
   # From repo root:
   cd src/frontend
   npm run dev
   ```

3. **Disable Offline Mode**
   - Open the application at http://localhost:5173
   - Navigate to **Settings** in the sidebar
   - Toggle **Offline Mode (Replay)** to OFF

The application will now make real API calls to Azure AI Foundry. The backend API runs at http://localhost:8000.

---

## Authentication (Optional)

For cloud deployments, you can integrate with the GBB auth mechanism. This is not required for local demos. Set `AUTH=false` in both environment files to skip authentication.

