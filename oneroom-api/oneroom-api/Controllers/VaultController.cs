﻿using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using oneroom_api.Hubs;

namespace oneroom_api.Controllers
{
    [Route("api/[controller]/{gameId}/{teamId}")]
    [ApiController]
    public class VaultController : ControllerBase
    {
        private readonly IHubContext<OneHub, IActionClient> _hubClients;

        public VaultController(
            IHubContext<OneHub, IActionClient> hubClients)
        {
            _hubClients = hubClients;
        }

        [HttpPost]
        public async Task<bool> FinishGame([FromForm]string password,int gameId,int teamId)
        {
            if (!password.Equals("7255")) return false;
            await _hubClients.Clients.Group(gameId.ToString()).FinishGame(teamId);
            return true;
        }
    }
}