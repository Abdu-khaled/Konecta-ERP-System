# .NET 8 ReportingService container
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# copy project files and restore first for layer caching
COPY reporting-service/ReportingService/ReportingService.csproj ReportingService/
RUN dotnet restore ReportingService/ReportingService.csproj
# copy the rest of the source
COPY reporting-service/ReportingService/ ./ReportingService/
RUN dotnet publish ReportingService/ReportingService.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
# Listen on 8080 in container; map host port in compose
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "ReportingService.dll"]
