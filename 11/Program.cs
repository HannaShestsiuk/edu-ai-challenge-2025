using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;

namespace AudioAIChallenge
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("=== AI Audio Transcriber, Summarizer & Analyzer ===");
            string defaultFile = "CAR0004.mp3";

            // Get OpenAI API Key
            string apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                Console.Write("Enter your OpenAI API key: ");
                apiKey = Console.ReadLine();
            }

            while (true)
            {
                // Prompt with default suggestion
                Console.Write($"\nEnter audio file path (or press Enter for default '{defaultFile}', or type 'exit' to quit): ");
                string audioFile = Console.ReadLine();

                if (string.IsNullOrWhiteSpace(audioFile))
                    audioFile = defaultFile;

                if (audioFile.Trim().ToLower() == "exit")
                {
                    Console.WriteLine("Goodbye!");
                    break;
                }

                if (!File.Exists(audioFile))
                {
                    Console.WriteLine($"File '{audioFile}' not found. Try again.");
                    continue;
                }

                // Generate output file basename with timestamp
                string baseName = Path.GetFileNameWithoutExtension(audioFile)
                    + "-" + DateTime.Now.ToString("yyyyMMdd-HHmmss");

                // 1. Transcribe audio using Whisper
                Console.WriteLine("Transcribing audio...");
                string transcript = await TranscribeWithWhisperAsync(audioFile, apiKey);

                string transcriptionPath = $"transcription-{baseName}.md";
                await File.WriteAllTextAsync(transcriptionPath, transcript);

                // 2. Summarize transcript using GPT
                Console.WriteLine("Summarizing transcript...");
                string summary = await SummarizeWithGptAsync(transcript, apiKey);

                string summaryPath = $"summary-{baseName}.md";
                await File.WriteAllTextAsync(summaryPath, summary);

                // 3. Extract analytics using GPT
                Console.WriteLine("Calculating analytics...");
                string analyticsJson = await AnalyzeWithGptAsync(transcript, apiKey);

                string analyticsPath = $"analysis-{baseName}.json";
                await File.WriteAllTextAsync(analyticsPath, analyticsJson);

                // Print results on console
                Console.WriteLine("\n=== SUMMARY ===\n" + summary);
                Console.WriteLine("\n=== ANALYTICS ===\n" + analyticsJson);
                Console.WriteLine($"\nSaved files:\n {transcriptionPath}\n {summaryPath}\n {analyticsPath}");
            }
        }

        // Transcribe using Whisper v1
        static async Task<string> TranscribeWithWhisperAsync(string audioFile, string apiKey)
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var mp3Content = new ByteArrayContent(await File.ReadAllBytesAsync(audioFile));
            mp3Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("audio/mpeg");

            // multipart/form-data for uploading the file
            var form = new MultipartFormDataContent();
            form.Add(mp3Content, "file", Path.GetFileName(audioFile));
            form.Add(new StringContent("whisper-1"), "model");
            form.Add(new StringContent("text"), "response_format"); // 'text' = plain text transcript; for JSON use 'json'

            var response = await client.PostAsync("https://api.openai.com/v1/audio/transcriptions", form);
            var respContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
                return respContent.Trim();

            return $"Error during transcription:\n{respContent}";
        }

        // Summarize the transcript
        static async Task<string> SummarizeWithGptAsync(string transcript, string apiKey)
        {
            string prompt = @"You are an expert meeting assistant. Summarize the following transcript into a concise, well-structured markdown format. Focus on key ideas and main takeaways.

Transcript:
===
" + transcript + "\n===";

            var requestBody = new
            {
                model = "gpt-4.1-mini", // or gpt-4 if you have access
                messages = new[]
                {
                    new { role = "system", content = "You summarize transcripts." },
                    new { role = "user", content = prompt }
                },
                max_tokens = 500,
                temperature = 0.2
            };

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            var reqJson = JsonSerializer.Serialize(requestBody);

            var response = await client.PostAsync(
                "https://api.openai.com/v1/chat/completions",
                new StringContent(reqJson, Encoding.UTF8, "application/json"));
            var respContent = await response.Content.ReadAsStringAsync();

            try
            {
                using var doc = JsonDocument.Parse(respContent);
                return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString().Trim();
            }
            catch
            {
                return $"Error in summary:\n{respContent}";
            }
        }

        // Analytics: word count, speaking speed, frequent topics (in JSON)
        static async Task<string> AnalyzeWithGptAsync(string transcript, string apiKey)
        {
            // Est. duration logic: if Whisper provides duration, you can pass it, 
            // else estimate from average speaking speed (e.g., 130 wpm) as fallback.
            // We'll ask OpenAI to estimate from transcript length.
            string analysisPrompt = @"
Extract the following analytics from the transcript:
1. Total word count
2. Estimate the speaking speed in words per minute based on transcript length and typical speaking pace (if you can infer it; otherwise, estimate).
3. Identify the 3 or more most frequently mentioned topics/phrases and count how often each is mentioned.

Return STRICTLY this valid JSON object format:
{
  ""word_count"": INT,
  ""speaking_speed_wpm"": INT,
  ""frequently_mentioned_topics"": [
    { ""topic"": STRING, ""mentions"": INT },
    ...
  ]
}

Transcript:
===
" + transcript + "\n===";

            var requestBody = new
            {
                model = "gpt-4.1-mini",
                messages = new[]
                {
                    new { role = "system", content = "You provide analytics from transcripts as strict JSON." },
                    new { role = "user", content = analysisPrompt }
                },
                max_tokens = 600,
                temperature = 0.1
            };

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            var reqJson = JsonSerializer.Serialize(requestBody);

            var response = await client.PostAsync(
                "https://api.openai.com/v1/chat/completions",
                new StringContent(reqJson, Encoding.UTF8, "application/json"));
            var respContent = await response.Content.ReadAsStringAsync();

            try
            {
                using var doc = JsonDocument.Parse(respContent);
                var json = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
                // Make sure returned JSON is valid/clean before returning, otherwise just return as-is.
                using var _ = JsonDocument.Parse(json); // will throw if not valid
                return json;
            }
            catch
            {
                return $"Error in analytics:\n{respContent}";
            }
        }
    }
}