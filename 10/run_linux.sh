#!/bin/bash
echo "Running C# console app with dotnet run..."

# If this is not already a .NET project, initialize it
if [ ! -f "./*.csproj" ]; then
    echo "No .csproj found. Initializing new console project..."
    dotnet new console -n App
    cp Program.cs App/Program.cs
    cd App
fi

dotnet run
