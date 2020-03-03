using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Telegram.Bot.Exceptions;
using Telegram.Bot.Types;

namespace LocusPocusBot.Controllers
{
    [Route("/[controller]")]
    public class UpdateController : Controller
    {
        private readonly ILogger<UpdateController> logger;
        private readonly IServiceProvider serviceProvider;
        
        public UpdateController(ILogger<UpdateController> logger,
                                IServiceProvider serviceProvider)
        {
            this.logger = logger;
            this.serviceProvider = serviceProvider;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok();
        }

        // POST /update
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]Update update)
        {
            // Create a scope for the update that is about to be processed
            using (var scope = this.serviceProvider.CreateScope())
            {
                // Get an IUpdateProcessor instance
                var updateService = scope.ServiceProvider.GetRequiredService<IUpdateProcessor>();

                try
                {
                    // Process the update
                    await updateService.ProcessUpdate(update);
                }
                catch (MessageIsNotModifiedException)
                {
                    // ignore
                }
                catch (Exception ex)
                {
                    this.logger.LogError(ex, "Exception [{Message}] while handling update {Update}",
                        ex.Message.Replace('\n', '|'), // keep the message on one line
                        update.ToJson()
                    );
                }
            }

            return Ok();
        }
    }
}
