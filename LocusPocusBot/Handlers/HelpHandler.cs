using LocusPocusBot.Rooms;
using System.Text;
using System.Threading.Tasks;
using Telegram.Bot.Types.Enums;

namespace LocusPocusBot.Handlers
{
    public class HelpHandler : HandlerBase
    {
        private readonly IBotService bot;
        private readonly Department[] departments;

        public HelpHandler(IBotService botService,
                           Department[] departments)
        {
            this.bot = botService;
            this.departments = departments;
        }

        public override async Task Run()
        {
            StringBuilder msg = new StringBuilder();
            
            msg.AppendLine("*UniVRAuleBot* è il bot per controllare la disponibilità delle aule presso le sedi dell'Università di Verona 🎓");
            msg.AppendLine();
            msg.AppendLine("👉 *Usa uno di questi comandi per ottenere la lista delle aule libere*");
            msg.AppendLine();

            foreach (Department dep in this.departments)
            {
                msg.Append($"*{dep.Name}*");
                msg.Append(": /");
                msg.AppendLine(dep.Slug);
            }

            msg.AppendLine();
            msg.AppendLine("ℹ️ I dati visualizzati provengono da [logistica.univr.it](https://logistica.univr.it/PortaleStudentiUnivr/index.php?view=rooms&include=rooms&_lang=en&empty_box=0&col_cells=0)");
            msg.AppendLine();
            msg.AppendLine("⚠️ I dati mostrati potrebbero non rispecchiare l'effettiva disponibilità dell'aula");
            msg.AppendLine();
            msg.AppendLine("💻 Il bot è [open source](https://github.com/francescotonini/univraule-bot)");

            await this.bot.Client.SendTextMessageAsync(
                chatId: this.Chat.Id,
                text: msg.ToString(),
                parseMode: ParseMode.Markdown,
                disableWebPagePreview: true
            );
        }
    }
}
