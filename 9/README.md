# Service Analyzer Console App

## Overview

This console app analyzes any digital service or product (by name or description) and outputs a detailed markdown report with business, tech, and user insights, using the OpenAI API.

## Prerequisites

- [.NET 6.0+](https://dotnet.microsoft.com/download)
- An OpenAI API Key ([get one here](https://platform.openai.com/account/api-keys))

## Setup

1. **Clone the repo / Copy source files**
2. **Build and run the app**:
   ```bash
   dotnet build
   dotnet run
   ```
   Or use the provided scripts:
   - On **Windows**: `run_windows.bat`
   - On **Linux/macOS**: `run_linux.sh`

## Usage

- **Enter a known service name** (e.g. Spotify, Notion)
- Or **Paste a paragraph describing a service**
- **Enter an OpenAI API key**
- App will display a markdown-formatted analysis report in the console.

## Output

Sections include:

- **Brief History**
- **Target Audience**
- **Core Features**
- **Unique Selling Points**
- **Business Model**
- **Tech Stack Insights**
- **Strengths & Weaknesses**
