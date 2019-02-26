﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using oneroom_api.Model;

namespace oneroom_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GamesController : ControllerBase
    {
        private readonly OneRoomContext _context;

        public GamesController(OneRoomContext context)
        {
            _context = context;
        }

        // GET: api/Games
        [HttpGet]
        [ProducesResponseType(200, Type = typeof(Task<ActionResult<IEnumerable<Game>>>))]
        [ProducesResponseType(404)]
        public ActionResult<IEnumerable<Game>> GetGames()
        {
            return _context.Games.ToList();
        }

        // GET: api/Games/groupName
        [HttpGet("{groupName}")]
        [ProducesResponseType(200, Type = typeof(Task<ActionResult<Game>>))]
        [ProducesResponseType(404)]
        public async Task<ActionResult<Game>> GetGame(String groupName)
        {
            var game = await _context.Games.Where(g => g.GroupName.Equals(groupName))
                                           .SingleOrDefaultAsync();

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
            var game = await (from e in _context.Games where e.GroupName == groupName select e).FirstOrDefaultAsync();
            if (game != null)
                return game.State;
            else
                return NotFound();
        }

        // POST api/Games/groupName/NextState
        [HttpPost("{groupName}/NextState")]
        [ProducesResponseType(200, Type =typeof(Task<State>))]
        [ProducesResponseType(404)]
        public async Task<ActionResult<State>> NextState(string groupName)
        {
            var game = await (from e in _context.Games where e.GroupName == groupName select e).FirstOrDefaultAsync();
            if (game != null)
            {
                game.State = game.State == State.REGISTER ? State.LAUNCH : game.State == State.LAUNCH ? State.END : State.END;
                _context.Entry(game).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return game.State;
            }
            else
                return NotFound();
        }

        // POST: api/Games
        [HttpPost("{groupName}")]
        [ProducesResponseType(201, Type = typeof(Task<ActionResult<Game>>))]
        [ProducesResponseType(404)]
        [ProducesResponseType(409)]
        public async Task<ActionResult<Game>> CreateGame(String groupName)
        {
            Game game = new Game(groupName);
            _context.Games.Add(game);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict("Game Already Exists");
            }

            return CreatedAtAction("GetGame", new { groupName }, game);
        }

        // DELETE: api/Games/groupName
        [HttpDelete("{groupName}")]
        [ProducesResponseType(200, Type = typeof(Task<ActionResult<Game>>))]
        [ProducesResponseType(404)]
        public async Task<ActionResult<Game>> DeleteGame(String groupName)
        {
            var game = await _context.Games.Where(g => g.GroupName.Equals(groupName))
                                           .SingleOrDefaultAsync();
            if (game == null)
            {
                return NotFound();
            }

            _context.Games.Remove(game);
            await _context.SaveChangesAsync();

            return game;
        }

        private bool GameExists(int id)
        {
            return _context.Games.Any(e => e.GameId == id);
        }
    }
}
