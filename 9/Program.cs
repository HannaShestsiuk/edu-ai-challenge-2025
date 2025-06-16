using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ServiceAnalyzer
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Welcome to the Service Analyzer!");
            Console.Write("Enter a service name or paste a service description: ");
            string userInput = Console.ReadLine();

            // Prompt construction
            string prompt = BuildPrompt(userInput);

            // OpenAI API key from environment variable
            string apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {

                Console.WriteLine("Please provide an api key:");
                apiKey = Console.ReadLine();
                
            }

            string response = await QueryOpenAIAsync(prompt, apiKey);

            Console.WriteLine("\n===== AI Generated Report =====");
            Console.WriteLine(response);
            Console.ReadKey();
        }

        // Construct the prompt (Include 1 few-shot example)
        private static string BuildPrompt(string input)
        {
            string exampleService = "Spotify";
            string exampleAnalysis =
@"# Service Analysis Report: Spotify

## Brief History
Founded in 2006 in Sweden, Spotify pioneered legal music streaming, launching publicly in 2008 and expanding globally.

## Target Audience
Music listeners worldwide; especially younger, tech-savvy users seeking on-demand access to a massive music library.

## Core Features
- On-demand streaming of music
- Playlists creation & sharing
- Personalized recommendations
- Offline listening (premium)

## Unique Selling Points
- Extensive music catalog
- Sophisticated recommendation engine
- Seamless multi-device sync

## Business Model
Freemium: Free, ad-supported tier + paid subscription (Premium), artist partnerships.

## Tech Stack Insights
Uses cloud infrastructure, mobile & desktop clients, machine learning for recommendations.

## Perceived Strengths
Best-in-class user experience, strong curated content, cross-device.

## Perceived Weaknesses
Limited artist compensation, regional restrictions, some premium-only features.
---
";

            return
$@"You are an expert analyst. Given a digital service or product name **OR** its description, generate a structured markdown report with these sections:

# Service Analysis Report: [Service Name]
## Brief History
## Target Audience
## Core Features
## Unique Selling Points
## Business Model
## Tech Stack Insights
## Perceived Strengths
## Perceived Weaknesses

Example:

{exampleAnalysis}

---
Now analyze this input and generate a markdown report following the above format: {input}";
        }

        private static async Task<string> QueryOpenAIAsync(string prompt, string apiKey)
        {
            // Set up HTTP client
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            // Prepare payload 
            var payload = new
            {
                model = "gpt-4.1-mini", // or "gpt-4" if you have access
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                max_tokens = 800,
                temperature = 0.8
            };
            var jsonPayload = JsonSerializer.Serialize(payload);

            // Call OpenAI API
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            Console.WriteLine("Generating report...");
            var response = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
            string responseString = await response.Content.ReadAsStringAsync();

            // Parse answer
            using var doc = JsonDocument.Parse(responseString);
            try
            {
                return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
            }
            catch
            {
                return $"Error from OpenAI API: {responseString}";
            }
        }
    }
}