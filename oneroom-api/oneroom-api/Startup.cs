﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using oneroom_api.data;
using oneroom_api.Hubs;

namespace oneroom_api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            services.AddDbContext<OneRoomContext>(options =>
                    options.UseSqlServer(Configuration.GetConnectionString("OneRoomContext")));

            // Enable signalR
            services.AddSignalR().AddAzureSignalR(Configuration.GetConnectionString("AzureSignalR"));
            services.AddApplicationInsightsTelemetry(Configuration["APPINSIGHTS_CONNECTIONSTRING"]);

            // Register the Swagger services
            //services.AddSwaggerDocument();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            // global cors policy
            app.UseCors(x => x
                .WithOrigins(
                "http://localhost:4200", 
                "http://localhost:4201", 
                "http://localhost:4202", 
                "http://localhost:4203",
                "https://dashboard-oneroom-v2.azurewebsites.net",
                "https://launcher-oneroom-v2.azurewebsites.net",
                "https://leaderboard-oneroom-v2.azurewebsites.net",
                "https://register-oneroom-v2.azurewebsites.net")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());
             
            // app.UseHttpsRedirection();
            app.UseMvc();

            // use signalR with routes
            app.UseAzureSignalR(route =>
            {
                route.MapHub<OneHub>("/LeaderBoardHub");
            });

            // Register the Swagger generator and the Swagger UI middlewares
            //app.UseSwagger();
            //app.UseSwaggerUi3();
        }
    }
}
