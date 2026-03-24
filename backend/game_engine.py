import asyncio
import time
import uuid
from order_matching import OrderBook
from bot_engine import BotManager
from puzzle_engine import get_puzzle

class GameState:
    WAITING   = "waiting"
    ACTIVE    = "active"
    RESULTS   = "results"

class Game:
    def __init__(self, room_id: str, num_bots: int = 10, round_duration: int = 60):
        self.room_id       = room_id
        self.num_bots      = num_bots
        self.round_duration = round_duration
        self.state         = GameState.WAITING
        self.players       = {}   # player_id -> {name, balance, total_pnl}
        self.current_round = 0
        self.max_rounds    = 5
        self.order_book    = None
        self.bot_manager   = None
        self.current_puzzle = None
        self.round_start_time = None
        self.leaderboard   = []
        self.round_history = []

    def add_player(self, player_id: str, name: str) -> bool:
        if self.state != GameState.WAITING:
            return False
        self.players[player_id] = {
            "name": name,
            "balance": 10000,
            "total_pnl": 0.0
        }
        return True

    async def start_game(self, broadcast_fn):
        self.state       = GameState.ACTIVE
        self.bot_manager = BotManager(self.num_bots)
        await broadcast_fn({
            "event": "game_started",
            "players": list(self.players.values()),
            "total_rounds": self.max_rounds
        })
        for round_num in range(1, self.max_rounds + 1):
            await self._run_round(round_num, broadcast_fn)
            await asyncio.sleep(5)
        await self._end_game(broadcast_fn)

    async def _run_round(self, round_num: int, broadcast_fn):
        self.current_round    = round_num
        self.order_book       = OrderBook()
        self.current_puzzle   = get_puzzle()
        self.round_start_time = time.time()

        await broadcast_fn({
            "event": "round_start",
            "round": round_num,
            "puzzle": {
                "title": self.current_puzzle["title"],
                "description": self.current_puzzle["description"]
            },
            "duration": self.round_duration
        })

        # Run bots immediately at round start
        self.bot_manager.run_bots(
            self.current_puzzle["true_fair_value"],
            self.order_book
        )

        await broadcast_fn({
            "event": "order_book_update",
            "book": self.order_book.get_book_snapshot()
        })

        # Countdown with periodic bot activity and book updates
        elapsed = 0
        while elapsed < self.round_duration:
            await asyncio.sleep(5)
            elapsed += 5

            # Bots trade every 10 seconds
            if elapsed % 10 == 0:
                self.bot_manager.run_bots(
                    self.current_puzzle["true_fair_value"],
                    self.order_book
                )

            await broadcast_fn({
                "event": "order_book_update",
                "book": self.order_book.get_book_snapshot(),
                "time_left": self.round_duration - elapsed
            })

        # Round ends — reveal true value
        true_value = self.current_puzzle["true_fair_value"]
        pnl        = self.order_book.calculate_pnl(true_value)

        # Update player balances
        for player_id, player in self.players.items():
            round_pnl = pnl.get(player_id, 0)
            player["total_pnl"] += round_pnl
            player["balance"]   += round_pnl

        self.round_history.append({
            "round": round_num,
            "puzzle": self.current_puzzle,
            "true_value": true_value,
            "pnl": pnl
        })

        await broadcast_fn({
            "event": "round_end",
            "round": round_num,
            "true_value": true_value,
            "hint_1": self.current_puzzle["hint_1"],
            "hint_2": self.current_puzzle["hint_2"],
            "round_pnl": pnl,
            "leaderboard": self._get_leaderboard()
        })

    def place_order(self, player_id: str, side: str, price: float, quantity: int):
        if self.state != GameState.ACTIVE:
            return {"error": "Game not active"}
        if player_id not in self.players:
            return {"error": "Player not in game"}
        if self.order_book is None:
            return {"error": "Round not started"}
        trades = self.order_book.add_order(player_id, side, price, quantity)
        return {
            "success": True,
            "trades": len(trades),
            "book": self.order_book.get_book_snapshot()
        }

    def _get_leaderboard(self) -> list:
        lb = [
            {
                "name": p["name"],
                "total_pnl": round(p["total_pnl"], 2),
                "balance": round(p["balance"], 2)
            }
            for p in self.players.values()
        ]
        return sorted(lb, key=lambda x: x["total_pnl"], reverse=True)

    async def _end_game(self, broadcast_fn):
        self.state = GameState.RESULTS
        await broadcast_fn({
            "event": "game_over",
            "final_leaderboard": self._get_leaderboard(),
            "round_history": self.round_history
        })


class RoomManager:
    def __init__(self):
        self.rooms = {}

    def create_room(self, num_bots: int = 10, round_duration: int = 60) -> str:
        room_id = str(uuid.uuid4())[:8].upper()
        self.rooms[room_id] = Game(room_id, num_bots, round_duration)
        return room_id

    def get_room(self, room_id: str) -> Game:
        return self.rooms.get(room_id)

    def delete_room(self, room_id: str):
        if room_id in self.rooms:
            del self.rooms[room_id]