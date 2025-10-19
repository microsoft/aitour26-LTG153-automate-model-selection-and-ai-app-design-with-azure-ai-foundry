# Zava Model Router Demo - Technical Architecture & Source Code Map

> **Note**: For setup instructions and user guides, see [README.md](README.md). This document provides detailed technical architecture and code organization reference for developers.

[[_TOC_]]

This project is a web application with a React frontend and a Python backend.

# File Structure

```
.
├── app.py
├── data
│   ├── pricing.json
│   ├── scenarios.json
│   └── scenario_source_data
│       ├── development
│       │   ├── bug_reports.json
│       │   ├── competitive_analysis.md
│       │   ├── feature_requests.json
│       │   └── product_launch_notes.md
│       ├── finance
│       │   ├── expense_reports.json
│       │   ├── historical_sales.csv
│       │   ├── invoice_data.json
│       │   └── sec_filing_snippet.txt
│       └── marketing
│           ├── brand_reputation_forums.json
│           ├── campaign_performance.csv
│           ├── customer_data.csv
│           └── social_media_mentions.json
├── index.html
├── package.json
├── public
│   └── zava-logo.png
├── README.md
├── requirements.txt
├── src
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
└── vite.config.js
```

# Frontend (React + Vite)

*   **main.jsx**: This is the main entry point for your React application. It's responsible for rendering the root component (`App`) into the HTML.
*   **App.jsx**: This is the main component of your React application. It contains the core UI and application logic, including fetching data from the backend, handling user interactions, and **cost calculation logic**. Implements Model Router cost formula: `(Router input price + Underlying model input price) × Input tokens + Underlying model output price × Output tokens`.
*   **index.css**: This file contains the global CSS styles for your application.
*   **index.html**: This is the main HTML page that is served to the browser. The React application is injected into this file.
*   **vite.config.js**: This is the configuration file for Vite, which is used as the build tool and development server for the frontend.
*   **public/zava-logo.png**: This is a static image asset, the Zava logo, which is publicly accessible.

# Backend (Python)

*   **app.py**: This is a Python script, which is a Flask web server that serves as the backend API for your application and serves the static frontend files.
*   **data/scenarios.json**: This JSON file contains the scenarios for the demo. Each scenario includes a title, prompt, complexity, quality expectation, sample output, and a `source_data_file` key pointing to the raw data for the RAG pattern.
*   **data/pricing.json**: This JSON file contains the pricing configuration for different AI models per 1M tokens (input/output). Includes Model Router pricing ($0.14 input, $0.00 output) and underlying model costs. **Critical for accurate cost analysis calculations.**
*   **data/scenario_source_data/**: This directory contains the sample data files that are combined with the prompts as part of the Retrieval-Augmented Generation (RAG) implementation.

# Configuration and Dependencies

*   **package.json**: This file defines the project's metadata and lists the JavaScript dependencies required for the frontend. It also likely contains scripts for running the development server, building the project, etc.
*   **requirements.txt**: This file lists the Python packages that the backend depends on. These can be installed using `pip`.
*   **node_modules**: This directory contains all the downloaded JavaScript dependencies (packages) for the frontend.
*   **README.md**: This file should contain documentation and instructions for the project.


# Visual map

::: mermaid

graph TD
    subgraph Frontend
        A[index.html] --> B(main.jsx);
        B --> C{App.jsx};
        C --> D[index.css];
        C --> E[public/zava-logo.png];
    end

    subgraph Backend & Data
        F[app.py] --> G[data/scenarios.json];
        F --> P[data/pricing.json];
        G --> H[data/scenario_source_data/];
    end

    subgraph "Build & Config"
        I[vite.config.js];
        J[package.json];
        K[requirements.txt];
        L[README.md];
    end

    C --> F;

    style Frontend fill:#D6EAF8,stroke:#333,stroke-width:2px
    style "Backend & Data" fill:#D5F5E3,stroke:#333,stroke-width:2px
    style "Build & Config" fill:#FCF3CF,stroke:#333,stroke-width:2px

:::

1.  **Frontend (Blue)**: This section shows the user-facing part of your application.
    *   `index.html` is the main page.
    *   `main.jsx` is the entry point for the React code.
    *   `App.jsx` is the main React component, which uses the CSS and the logo.
2.  **Backend & Data (Green)**: This section represents the server-side logic and data sources.
    *   `app.py` is the main Flask server file.
    *   `data/scenarios.json` provides the core scenario definitions to the application.
    *   `data/pricing.json` contains model pricing configurations used for accurate cost analysis calculations.
    *   `data/scenario_source_data/` holds the raw data files used for the RAG pattern, linked from `scenarios.json`.
3.  **Build & Config (Yellow)**: These are the files that configure and define the project.
4.  **Connection**: The arrow from `App.jsx` to `app.py` shows that the frontend communicates with the backend (e.g., to fetch data or send prompts).

# Cost Calculation Architecture

## Model Router Cost Formula

The application implements accurate cost calculation for Model Router usage:

**Model Router Total Cost = (Router Input Price + Underlying Model Input Price) × Input Tokens + Underlying Model Output Price × Output Tokens**

### Key Components:

1. **Router Input Cost**: $0.14 per 1M tokens (routing service fee)
2. **Underlying Model Input Cost**: Varies by routed model (e.g., GPT-5 Nano: $0.05/1M)
3. **Underlying Model Output Cost**: Varies by routed model (e.g., GPT-5 Nano: $0.40/1M)

### Implementation:

- **Frontend (`App.jsx`)**: Contains `calculateCost()` function with Model Router logic
- **Data (`pricing.json`)**: Stores pricing configuration for all models
- **Cost Display**: Shows detailed breakdown including router fee + underlying model costs

### Example:
If Model Router routes to GPT-5 Nano:
- Input cost: ($0.14 + $0.05) × tokens = $0.19/1M tokens
- Output cost: $0.40/1M tokens (underlying model only)
- Results in realistic cost savings vs. direct premium model usage