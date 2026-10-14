FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Greenhouse.Api/Greenhouse.Api.csproj Greenhouse.Api/
RUN dotnet restore Greenhouse.Api/Greenhouse.Api.csproj
COPY Greenhouse.Api/ Greenhouse.Api/
RUN dotnet publish Greenhouse.Api/Greenhouse.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Greenhouse.Api.dll"]
