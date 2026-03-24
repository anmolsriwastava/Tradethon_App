from dataclasses import dataclass, field
from typing import List, Optional
import time
import uuid

@dataclass
class Order:
    id: str
    user_id: str
    side: str  # "buy" or "sell"
    price: float
    quantity: int
    timestamp: float = field(default_factory=time.time)
    is_bot: bool = False

@dataclass
class Trade:
    buy_order_id: str
    sell_order_id: str
    price: float
    quantity: int
    timestamp: float = field(default_factory=time.time)

class OrderBook:
    def __init__(self):
        self.buy_orders: List[Order] = []   # sorted high to low
        self.sell_orders: List[Order] = []  # sorted low to high
        self.trades: List[Trade] = []
        self.positions: dict = {}           # user_id -> net position

    def add_order(self, user_id: str, side: str, price: float, quantity: int, is_bot: bool = False) -> List[Trade]:
        order = Order(
            id=str(uuid.uuid4()),
            user_id=user_id,
            side=side,
            price=price,
            quantity=quantity,
            is_bot=is_bot
        )
        new_trades = self._match(order)
        return new_trades

    def _match(self, incoming: Order) -> List[Trade]:
        new_trades = []

        if incoming.side == "buy":
            self.sell_orders.sort(key=lambda o: (o.price, o.timestamp))
            while incoming.quantity > 0 and self.sell_orders:
                best_sell = self.sell_orders[0]
                if incoming.price >= best_sell.price:
                    traded_qty = min(incoming.quantity, best_sell.quantity)
                    trade = Trade(
                        buy_order_id=incoming.id,
                        sell_order_id=best_sell.id,
                        price=best_sell.price,
                        quantity=traded_qty
                    )
                    new_trades.append(trade)
                    self.trades.append(trade)
                    self._update_position(incoming.user_id, traded_qty, best_sell.price, "buy")
                    self._update_position(best_sell.user_id, traded_qty, best_sell.price, "sell")
                    incoming.quantity -= traded_qty
                    best_sell.quantity -= traded_qty
                    if best_sell.quantity == 0:
                        self.sell_orders.pop(0)
                else:
                    break
            if incoming.quantity > 0:
                self.buy_orders.append(incoming)
                self.buy_orders.sort(key=lambda o: (-o.price, o.timestamp))

        elif incoming.side == "sell":
            self.buy_orders.sort(key=lambda o: (-o.price, o.timestamp))
            while incoming.quantity > 0 and self.buy_orders:
                best_buy = self.buy_orders[0]
                if incoming.price <= best_buy.price:
                    traded_qty = min(incoming.quantity, best_buy.quantity)
                    trade = Trade(
                        buy_order_id=best_buy.id,
                        sell_order_id=incoming.id,
                        price=best_buy.price,
                        quantity=traded_qty
                    )
                    new_trades.append(trade)
                    self.trades.append(trade)
                    self._update_position(best_buy.user_id, traded_qty, best_buy.price, "buy")
                    self._update_position(incoming.user_id, traded_qty, best_buy.price, "sell")
                    incoming.quantity -= traded_qty
                    best_buy.quantity -= traded_qty
                    if best_buy.quantity == 0:
                        self.buy_orders.pop(0)
                else:
                    break
            if incoming.quantity > 0:
                self.sell_orders.append(incoming)
                self.sell_orders.sort(key=lambda o: (o.price, o.timestamp))

        return new_trades

    def _update_position(self, user_id: str, quantity: int, price: float, side: str):
        if user_id not in self.positions:
            self.positions[user_id] = {"qty": 0, "cost": 0.0}
        if side == "buy":
            self.positions[user_id]["qty"] += quantity
            self.positions[user_id]["cost"] += quantity * price
        else:
            self.positions[user_id]["qty"] -= quantity
            self.positions[user_id]["cost"] -= quantity * price

    def calculate_pnl(self, true_value: float) -> dict:
        pnl = {}
        for user_id, pos in self.positions.items():
            pnl[user_id] = round(pos["qty"] * true_value + pos["cost"], 2)
        return pnl

    def get_book_snapshot(self) -> dict:
        return {
            "bids": [{"price": o.price, "qty": o.quantity, "is_bot": o.is_bot}
                     for o in self.buy_orders[:5]],
            "asks": [{"price": o.price, "qty": o.quantity, "is_bot": o.is_bot}
                     for o in self.sell_orders[:5]]
        }

    def reset(self):
        self.buy_orders = []
        self.sell_orders = []
        self.trades = []
        self.positions = {}