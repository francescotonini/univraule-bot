using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System.Threading;
using System.Threading.Tasks;

namespace LocusPocusBot
{
    class SettingsValidationHostedService : IHostedService
    {
        public SettingsValidationHostedService(IOptions<BotConfiguration> bot)
        {
            bot.Value.Validate();
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
