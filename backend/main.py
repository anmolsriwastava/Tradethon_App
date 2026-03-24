import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from game_engine import RoomManager

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

room_manager = RoomManager()

# Store active websocket connections per room
connections: dict = {}  # room_id -> {player_id -> WebSocket}


# --- Helper ---
async def broadcast(room_id: str, message: dict):
    if room_id not in connections:
        return
    dead = []
    for player_id, ws in connections[room_id].items():
        try:
            await ws.send_json(message)
        except Exception:
            dead.append(player_id)
    for p in dead:
        del connections[room_id][p]


# --- REST Endpoints ---
class CreateRoomRequest(BaseModel):
    num_bots: int = 10
    round_duration: int = 60

class JoinRoomRequest(BaseModel):
    player_name: str

class OrderRequest(BaseModel):
    player_id: str
    side: str
    price: float
    quantity: int


@app.post("/room/create")
def create_room(req: CreateRoomRequest):
    room_id = room_manager.create_room(req.num_bots, req.round_duration)
    return {"room_id": room_id}


@app.post("/room/{room_id}/join")
def join_room(room_id: str, req: JoinRoomRequest):
    game = room_manager.get_room(room_id)
    if not game:
        return {"error": "Room not found"}
    import uuid
    player_id = str(uuid.uuid4())[:8]
    success = game.add_player(player_id, req.player_name)
    if not success:
        return {"error": "Game already started"}
    return {"player_id": player_id, "room_id": room_id}


@app.post("/room/{room_id}/start")
async def start_game(room_id: str):
    game = room_manager.get_room(room_id)
    if not game:
        return {"error": "Room not found"}
    if game.state != "waiting":
        return {"error": "Game already started"}
    game.state = "active"
    asyncio.create_task(
        game.start_game(lambda msg: broadcast(room_id, msg))
    )
    return {"status": "Game starting"}


@app.post("/room/{room_id}/order")
def place_order(room_id: str, req: OrderRequest):
    game = room_manager.get_room(room_id)
    if not game:
        return {"error": "Room not found"}
    result = game.place_order(
        req.player_id,
        req.side,
        req.price,
        req.quantity
    )
    return result


@app.get("/room/{room_id}/book")
def get_order_book(room_id: str):
    game = room_manager.get_room(room_id)
    if not game:
        return {"error": "Room not found"}
    if not game.order_book:
        return {"bids": [], "asks": []}
    return game.order_book.get_book_snapshot()


@app.get("/room/{room_id}/leaderboard")
def get_leaderboard(room_id: str):
    game = room_manager.get_room(room_id)
    if not game:
        return {"error": "Room not found"}
    return {"leaderboard": game._get_leaderboard()}


# --- WebSocket ---
@app.websocket("/ws/{room_id}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, player_id: str):
    await websocket.accept()
    if room_id not in connections:
        connections[room_id] = {}
    connections[room_id][player_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if room_id in connections and player_id in connections[room_id]:
            del connections[room_id][player_id]