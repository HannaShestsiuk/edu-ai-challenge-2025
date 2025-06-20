# Audio Transcriber, Summarizer & Analyzer Console App

## Overview

This C# console app accepts an audio file, generates a transcription using OpenAI Whisper, summarizes the main ideas with OpenAI GPT, and extracts meaningful analytics—all via the OpenAI API. It works with any spoken audio file and creates a new result file for each transcription.

You will receive for each audio:
- A **transcription** (`transcription.md`)
- A **summary** (`summary.md`)
- **Analytics** in JSON (`analysis.json`)

## Prerequisites

- [.NET 8.0+](https://dotnet.microsoft.com/download)
- An OpenAI API Key ([get one here](https://platform.openai.com/account/api-keys))

## Setup

1. **Clone the repo or copy source files**  
   Ensure `products.json` is in the same directory as the executable or source files.

2. **Build and run the app:**
   ```bash
   dotnet build
   dotnet run

3. **Or use the provided scripts (if available):**

   On Windows: run_windows.bat
   On Linux/macOS: run_linux.sh

## Usage
   When prompted, enter the path to your audio file, e.g.
   CAR0004.mp3 or /path/to/your/audiofile.mp3

   Enter your OpenAI API key if you haven’t set OPENAI_API_KEY as an environment variable.

   The app will:

   Transcribe the audio using Whisper (whisper-1) Output is saved as transcription-YYYYMMDD-HHMMSS.md
   Summarize the transcript using GPT-3.5/4 Output is saved as summary-YYYYMMDD-HHMMSS.md
   Extract analytics (JSON with word count, speaking speed WPM, and most frequent topics) Output is saved as analysis-YYYYMMDD-HHMMSS.json
   Print the summary and analytics to the console
   You can process as many files as you want; each run creates a new set of output files.

## Output
   For each processed audio file, you will get:

   transcription-YYYYMMDD-HHMMSS.md – full transcript (Markdown)
   summary-YYYYMMDD-HHMMSS.md – concise summary (Markdown)
   analysis-YYYYMMDD-HHMMSS.json – analytics, e.g.:
   {
   "word_count": 1280,
   "speaking_speed_wpm": 132,
   "frequently_mentioned_topics": [
      { "topic": "Customer Onboarding", "mentions": 6 },
      { "topic": "Q4 Roadmap", "mentions": 4 },
      { "topic": "AI Integration", "mentions": 3 }
   ]
   }
   If the file is empty or audio is unclear, the app will inform you.

## Notes
   Transcription, summary, and analytics all use the OpenAI API—no local AI models required.
   All response files are timestamped to avoid overwriting previous results.
   You can customize the dataset or prompts for different use-cases.
   Processing time and cost depend on audio length and your OpenAI API subscription/quota.
