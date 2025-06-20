using System.Text.Json;
using System.Net.Http.Headers;
using System.Text;

namespace AiProductsConsoleApp
{
    // Model for a product
    public class Product
    {
        public string name { get; set; }
        public string category { get; set; }
        public double price { get; set; }
        public double rating { get; set; }
        public bool in_stock { get; set; }
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("=== AI Product Filter ===");

            // Load product dataset
            List<Product>? products = null;
            try
            {
                string jsonString = await File.ReadAllTextAsync("products.json");
                products = JsonSerializer.Deserialize<List<Product>>(jsonString);
            }
            catch
            {
                Console.WriteLine("Error reading or parsing products.json. Make sure the file exists and is valid.");
                return;
            }

            // OpenAI API key
            string apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                Console.Write("Enter your OPENAI_API_KEY: ");
                apiKey = Console.ReadLine();
            }

            // Query loop
            while (true)
            {
                Console.WriteLine("\nDescribe your desired product(s) ('exit' or blank to quit):");
                var userInput = Console.ReadLine();
                if (string.IsNullOrWhiteSpace(userInput) || userInput.Trim().ToLower() == "exit")
                {
                    Console.WriteLine("Goodbye!");
                    break;
                }

                string filteredProducts = await QueryOpenAIWithFunctionCall(userInput, products, apiKey);

                Console.WriteLine("\nFiltered Products:");
                Console.WriteLine(filteredProducts);
            }
        }

        // Function definition JSON (OpenAI function calling mechanism expects this format)
        private static object[] GetFunctionsDefinition()
        {
            var schema = new
            {
                name = "filter_products",
                description = "Filter products based on user preferences.",
                parameters = new
                {
                    type = "object",
                    properties = new
                    {
                        products = new
                        {
                            type = "array",
                            description = "List of filtered product objects.",
                            items = new
                            {
                                type = "object",
                                properties = new
                                {
                                    name = new { type = "string" },
                                    category = new { type = "string" },
                                    price = new { type = "number" },
                                    rating = new { type = "number" },
                                    in_stock = new { type = "boolean" }
                                },
                                required = new[] { "name", "category", "price", "rating", "in_stock" }
                            }
                        }
                    },
                    required = new[] { "products" }
                }
            };

            return new[] { schema };
        }

        private static async Task<string> QueryOpenAIWithFunctionCall(string userInput, List<Product> dataset, string apiKey)
        {
            Console.WriteLine("Processing...");
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var systemPrompt = @"You are an expert product assistant. Given a product catalog and user preferences,
use the 'filter_products' function to return all matching products. Only call the function with the filtered products.";

            // Attach product dataset for the model's context
            var userMessage = $@"Product catalog (JSON): 
{JsonSerializer.Serialize(dataset, new JsonSerializerOptions { WriteIndented = false })}
---
User preferences: {userInput}";

            // The 'function' for OpenAI to call
            var functions = GetFunctionsDefinition();

            // We use GPT-3.5/4 with function calling
            var requestBody = new
            {
                model = "gpt-4.1-mini",  // or gpt-4-1106-preview if you have access
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userMessage }
                },
                functions = functions,
                function_call = new { name = "filter_products" },
                temperature = 0
            };

            var reqJson = JsonSerializer.Serialize(requestBody);
            var response = await client.PostAsync("https://api.openai.com/v1/chat/completions",
                new StringContent(reqJson, Encoding.UTF8, "application/json"));
            var respContent = await response.Content.ReadAsStringAsync();

            // Parse function call arguments (JSON)
            try
            {
                using var doc = JsonDocument.Parse(respContent);
                var functionArgs = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("function_call")
                    .GetProperty("arguments")
                    .GetString();

                using var argsDoc = JsonDocument.Parse(functionArgs);
                var productsElement = argsDoc.RootElement.GetProperty("products");
                if (productsElement.ValueKind != JsonValueKind.Array || productsElement.GetArrayLength() == 0)
                    return "No products found matching your preferences.";

                // Format output
                var sb = new StringBuilder();
                int idx = 1;
                foreach (var prod in productsElement.EnumerateArray())
                {
                    string name = prod.GetProperty("name").GetString();
                    double price = prod.GetProperty("price").GetDouble();
                    double rating = prod.GetProperty("rating").GetDouble();
                    bool in_stock = prod.GetProperty("in_stock").GetBoolean();
                    sb.AppendLine($"{idx}. {name} - ${price:0.00}, Rating: {rating:0.0}, {(in_stock ? "In Stock" : "Out of Stock")}");
                    idx++;
                }

                return sb.ToString();
            }
            catch
            {
                return "Error interpreting OpenAI response:\n" + respContent;
            }
        }
    }
}