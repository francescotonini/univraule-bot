using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PlainConsoleLogger;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

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

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host.CreateDefaultBuilder(args)
                 .ConfigureWebHostDefaults(builder =>
                 {
                     builder.UseStartup<Startup>()
                        .ConfigureAppConfiguration(configure =>
                        {
                            configure.AddEnvironmentVariables();
                        })
                        .ConfigureAppConfiguration(ConfigureApp)
                        .ConfigureLogging(ConfigureLogging);
                 });
        }

        static async Task Main(string[] args)
        {
            IHost host = CreateHostBuilder(args).Build();

            ILogger logger = (ILogger)host.Services.GetService(typeof(ILogger<Program>));

            try
            {
                using (IServiceScope scope = host.Services.CreateScope())
                {
                    var initializer = (IAppInitializer)scope.ServiceProvider.GetRequiredService(typeof(IAppInitializer));
                    await initializer.InitializeAsync();
                }

                await host.RunAsync(shutdownTokenSource.Token);
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

        private static void ConfigureApp(WebHostBuilderContext hostContext, IConfigurationBuilder configApp)
        {
            // Load the application settings
            configApp.SetBasePath(Directory.GetCurrentDirectory());
            configApp.AddJsonFile("appsettings.json");
        }

        private static void ConfigureLogging(WebHostBuilderContext hostContext, ILoggingBuilder logging)
        {
            logging.AddConfiguration(hostContext.Configuration.GetSection("Logging"));

            logging.ClearProviders();
            logging.AddPlainConsole();
        }
    }
}
