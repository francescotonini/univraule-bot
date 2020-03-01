﻿using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using LocusPocusBot.Handlers;
using LocusPocusBot.Rooms;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PlainConsoleLogger;

namespace LocusPocusBot
{
    class Program
    {
        /// <summary>
        /// Holds the <see cref="CancellationToken"/> used
        /// for shutting down the WebHost
        /// </summary>
        private static CancellationTokenSource shutdownTokenSource =
            new CancellationTokenSource();

        public static IHost Host { get; }

        static Program()
        {
            Host = new HostBuilder()
                    .ConfigureAppConfiguration(ConfigureApp)
                    .ConfigureServices(ConfigureServices)
                    .ConfigureLogging(ConfigureLogging)
                    .UseConsoleLifetime(opts => opts.SuppressStatusMessages = true)
                    .Build();
        }

        static async Task Main(string[] args)
        {
            ILogger logger = Host.Services.GetRequiredService<ILogger<Program>>();

            try
            {
                await Host.RunAsync(shutdownTokenSource.Token);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unhandled exception");

                // Stop the WebHost, otherwise it might hang here
                shutdownTokenSource.Cancel();

                // Required to stop all the threads.
                // With "return 1", the process could actually stay online forever

                Environment.Exit(1);
            }
        }

        private static void ConfigureApp(HostBuilderContext hostContext, IConfigurationBuilder configApp)
        {
            // Load the application settings
            configApp.SetBasePath(Directory.GetCurrentDirectory());
            configApp.AddJsonFile("appsettings.json");
        }

        private static void ConfigureLogging(HostBuilderContext hostContext, ILoggingBuilder logging)
        {
            logging.AddConfiguration(hostContext.Configuration.GetSection("Logging"));
            logging.AddPlainConsole();
        }

        private static void ConfigureServices(HostBuilderContext hostContext, IServiceCollection services)
        {
            services.Configure<BotConfiguration>(hostContext.Configuration.GetSection("Bot"));

            // This also registers the service as a transient service
            services.AddHttpClient<IRoomsService, RoomsService>();

            services.AddSingleton<IBotService, BotService>();
            services.AddScoped<IUpdateProcessor, UpdateProcessor>();
            services.AddHandlers();

            services.AddSingleton(new Department[]
            {
                new Department("Ca' Vignal", "cavignal", 1, 2, 3),
                // new Department("Bolzano - Claudiana", "claudiana", 68, 69),
                new Department("Istituti biologici", "biologici", 22, 23),
                new Department("Medicina - Borgo Roma", "borgoroma", 27, 24, 29, 30, 40, 26),
                new Department("Medicina - Borgo Trento", "borgotrento", 31),
                new Department("Borgo Venezia", "borgovenezia", 33, 43),
                new Department("Cittadella", "cittadella", 17, 54),
                // new Department("Legnago", "legnago", 70, 71),
                // new Department("Rovereto", "rovereto", 61),
                new Department("S. Floriano", "floriano", 47),
                // new Department("Trento", "trento", 66),
                new Department("Veronetta", "veronetta", 5, 8, 57, 13, 10, 21, 63, 15, 9, 64, 60),
                new Department("Vicenza", "vicenza", 67, 58)
            });

            services.AddHostedService<SettingsValidationHostedService>();
            services.AddHostedService<BotHostedService>();
            services.AddHostedService<FetchSchedulerHostedService>();
        }
    }
}
