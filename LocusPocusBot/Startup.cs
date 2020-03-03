using LocusPocusBot.Handlers;
using LocusPocusBot.Rooms;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace LocusPocusBot
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            this.Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services
                .AddControllers()
                .AddNewtonsoftJson();

            services.Configure<BotConfiguration>(this.Configuration.GetSection("Bot"));

            services.AddScoped<IAppInitializer, AppInitializer>();

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
            services.AddHostedService<FetchSchedulerHostedService>();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
