using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace LocusPocusBot
{
    class AppInitializer : IAppInitializer
    {
        private readonly ILogger<AppInitializer> logger;
        private readonly IBotService bot;

        public AppInitializer(ILogger<AppInitializer> logger,
                              IBotService botService)
        {
            this.logger = logger;
            this.bot = botService;
        }

        public async Task InitializeAsync()
        {
            // Get information about the bot associated with the token
            this.bot.Me = await this.bot.Client.GetMeAsync();

            this.logger.LogInformation($"Running as @{this.bot.Me.Username}");
        }
    }
}
