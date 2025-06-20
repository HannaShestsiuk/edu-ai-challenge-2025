# AI Product Filter Console App

## Overview

This C# console app helps you find matching products from a dataset based on your natural language preferences (e.g. "headphones under $200 and in stock"). It uses OpenAI's function calling capability to perform flexible filtering — no manual filtering logic!

## Prerequisites

- [.NET 8.0+](https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/runtime-8.0.17-windows-x64-installer)
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
   Describe your desired products in plain English when prompted, e.g.
   "Wireless headphones under $100 with at least 4 stars, in stock"
   "Looking for a smartwatch with high rating and available now"

   Enter your OpenAI API key if you haven’t set OPENAI_API_KEY as an environment variable.
   The app will show you filtered products that match your preferences.
   You can ask multiple questions in a row — type exit or press Enter on a blank line to quit.
   Output
   For each query, you’ll see a list like:

   Filtered Products:
   1. Wireless Headphones - $99.99, Rating: 4.5, In Stock
   2. Smart Watch - $199.99, Rating: 4.6, In Stock
   If there are no matching products, the app will let you know.