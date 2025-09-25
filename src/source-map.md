# Zava Model Router Demo - Technical Architecture & Source Code Map

> **Note**: For setup instructions and user guides, see [README.md](README.md). This document provides detailed technical architecture and code organization reference for developers.

[[_TOC_]]

This project is a web application with a React frontend and a Python backend.

# File Structure

```
.
├── app.py
├── data
│   ├── scenario_source_data
│   │   ├── development
│   │   │   ├── bug_reports.json
│   │   │   ├── competitive_analysis.md
│   │   │   ├── feature_requests.json
│   │   │   └── product_launch_notes.md
│   │   ├── finance
│   │   │   ├── expense_reports.json
│   │   │   ├── historical_sales.csv
│   │   │   ├── invoice_data.json
│   │   │   └── sec_filing_snippet.txt
│   │   └── marketing
│   │       ├── brand_reputation_forums.json
│   │       ├── campaign_performance.csv
│   │       ├── customer_data.csv
│   │       └── social_media_mentions.json
│   └── scenarios.json
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
*   **App.jsx**: This is the main component of your React application. It contains the core UI and application logic, including fetching data from the backend and handling user interactions.
*   **index.css**: This file contains the global CSS styles for your application.
*   **index.html**: This is the main HTML page that is served to the browser. The React application is injected into this file.
*   **vite.config.js**: This is the configuration file for Vite, which is used as the build tool and development server for the frontend.
*   **public/zava-logo.png**: This is a static image asset, the Zava logo, which is publicly accessible.

# Backend (Python)

*   **app.py**: This is a Python script, which is a Flask web server that serves as the backend API for your application and serves the static frontend files.
*   **data/scenarios.json**: This JSON file contains the scenarios for the demo. Each scenario includes a title, prompt, complexity, quality expectation, sample output, and a `source_data_file` key pointing to the raw data for the RAG pattern.
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
    *   `data/scenario_source_data/` holds the raw data files used for the RAG pattern, linked from `scenarios.json`.
3.  **Build & Config (Yellow)**: These are the files that configure and define the project.
4.  **Connection**: The arrow from `App.jsx` to `app.py` shows that the frontend communicates with the backend (e.g., to fetch data or send prompts).