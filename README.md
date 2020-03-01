# UniVRAuleBot

This repository contains a Telegram bot that shows rooms availability at University of Verona.

## Previous versions

A previous version of this bot was developed in nodejs and has been available for about two year and a half. The code of that version is now available [in another branch](https://github.com/francescotonini/univraule-bot/tree/nodejs). This new version is based on [LocusPocusBot](https://github.com/matteocontrini/locuspocusbot) built by my good 'ol friend [matteocontrini](https://github.com/matteocontrini). This new version wouldn't be possible without him, so go on his repo and give him some love.

## Configuration

Configuration of the application is done through the `appsettings.json` file read from the current working directory at startup.

Examples for [development](https://github.com/francescotonini/univraule-bot/blob/master/LocusPocusBot/appsettings.example.development.json) and [production](https://github.com/francescotonini/univraule-bot/blob/master/LocusPocusBot/appsettings.example.json) environments are available.

## Running for development

Choose one of the following methods:

### Visual Studio

Requirements:

- .NET Core 3.1 SDK is installed
- The `LocusPocusBot/bin/Debug/netcoreapp3.1` directory contains the `appsettings.json` file

Run with the nice green button.

### dotnet CLI

Requirements:

- .NET Core 3.1 SDK is installed
- The `LocusPocusBot` directory contains the `appsettings.json` file

Run with the dotnet CLI by executing:

```sh
cd LocusPocusBot
dotnet run
```
