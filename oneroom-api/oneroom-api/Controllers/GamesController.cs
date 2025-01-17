﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using oneroom_api.data;
using oneroom_api.Hubs;
using oneroom_api.Model;
using oneroom_api.Utilities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


// TODO : add put and send signal to update config if changed


namespace oneroom_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GamesController : ControllerBase
    {
        private readonly OneRoomContext _context;
        private readonly IHubContext<OneHub, IActionClient> _hubClients;

        public GamesController(OneRoomContext context, IHubContext<OneHub, IActionClient> hubClients)
        {
            _context = context;
            _hubClients = hubClients;
        }

        // GET: api/Games
        [HttpGet]
        [ProducesResponseType(200, Type = typeof(Task<ActionResult<IEnumerable<GameDto>>>))]
        public async Task<ActionResult<IEnumerable<GameDto>>> GetGames()
        {
            // return config to select it
            return await _context.Games.Include(g => g.Config)
                                       .Include(g => g.Scenario)
                                       .Select(g => g.ToDto())
                                       .ToListAsync();
        }

        // GET: api/Games/groupName
        [HttpGet("{groupName}")]
        [ProducesResponseType(200, Type = typeof(Task<ActionResult<GameDto>>))]
        [ProducesResponseType(404)]
        public async Task<ActionResult<GameDto>> GetGame(string groupName)
        {
            GameDto game = await _context.Games.Include(g => g.Teams)
                                           .Include(g => g.Config)
                                           .Include(g => g.Scenario)
                                           .Select(g => g.ToDto())
                                           .SingleOrDefaultAsync(g => g.GroupName.Equals(groupName));

            if (game == null)
            {
                return NotFound();
            }

            return game;
        }

        // GET api/Games/groupName/State
        [HttpGet("{groupName}/State")]
        [ProducesResponseType(200, Type = typeof(Task<State>))]
        [ProducesResponseType(404)]
        public async Task<ActionResult<State>> GetStateGame(string groupName)
        {
            Game game = await (from e in _context.Games where e.GroupName == groupName select e).FirstOrDefaultAsync();
            if (game != null)
                return game.State;
            else
                return NotFound();
        }

        // POST api/Games/groupName/NextState
        [HttpPost("{groupName}/SwitchState/{newState}")]
        [ProducesResponseType(200, Type = typeof(Task<State>))]
        [ProducesResponseType(404)]
        public async Task<ActionResult<State>> SwitchState(string groupName, State newState)
        {
            Game game = await _context.Games.Where(e => e.GroupName == groupName)
                                            .Include(g => g.Teams)
                                                .ThenInclude(t => t.Users)
                                            .FirstOrDefaultAsync();
            if (game != null)
            {
                if (newState.Equals(State.REGISTER))
                {
                    if (game.Teams.Count() != 0)
                    {
                        _context.Teams.RemoveRange(game.Teams);
                    }
                }
                else if (game.Teams.Count() == 0)
                {
                    return BadRequest("Please create the teams before switching states");
                }

                game.State = newState;
                _context.Entry(game).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                // update state clients
                await _hubClients.Clients.Group(game.GameId.ToString()).UpdateGameState(game.State);

                if (newState.Equals(State.REGISTER))
                    await _hubClients.Clients.Group(game.GameId.ToString()).DeleteTeams(game.GameId);

                return game.State;
            }
            else
                return NotFound();
        }

        // POST: api/Games
        [HttpPost]
        [ProducesResponseType(201, Type = typeof(Task<ActionResult<Game>>))]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<ActionResult<Game>> CreateGame(Game game)
        {
            if (game == null)
            {
                return BadRequest();
            }

            _context.Games.Add(game);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict("Game Already Exists");
            }

            return CreatedAtAction("GetGame", new { game.GroupName }, game);
        }

        // DELETE: api/Games/groupName
        [HttpDelete("{groupName}")]
        [ProducesResponseType(200, Type = typeof(Task<ActionResult<Game>>))]
        [ProducesResponseType(404)]
        public async Task<ActionResult<Game>> DeleteGame(string groupName)
        {
            Game game = await _context.Games.SingleOrDefaultAsync(g => g.GroupName.Equals(groupName));
            if (game == null)
            {
                return NotFound();
            }

            _context.Games.Remove(game);
            await _context.SaveChangesAsync();
            // update clients
            await _hubClients.Clients.Group(game.GameId.ToString()).UpdateGame(game.GameId);

            return game;
        }
    }
}
