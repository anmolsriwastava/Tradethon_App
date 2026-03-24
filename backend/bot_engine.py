import random
import time
from order_matching import OrderBook

class Bot:
    def __init__(self, bot_id: str, personality: str, balance: float = 10000):
        self.bot_id = bot_id
        self.personality = personality  # "market_maker", "noise", "informed"
        self.balance = balance

    def get_orders(self, fair_value_estimate: float, book: OrderBook) -> list:
        if self.personality == "market_maker":
            return self._market_maker_orders(fair_value_estimate)
        elif self.personality == "noise":
            return self._noise_orders(fair_value_estimate)
        elif self.personality == "informed":
            return self._informed_orders(fair_value_estimate)
        return []

    def _market_maker_orders(self, fair_value: float) -> list:
        spread = random.uniform(1.5, 3.0)
        bid = round(fair_value - spread, 1)
        ask = round(fair_value + spread, 1)
        qty = random.randint(3, 8)
        return [
            {"user_id": self.bot_id, "side": "buy",  "price": bid, "quantity": qty, "is_bot": True},
            {"user_id": self.bot_id, "side": "sell", "price": ask, "quantity": qty, "is_bot": True}
        ]

    def _noise_orders(self, fair_value: float) -> list:
        side = random.choice(["buy", "sell"])
        noise = random.uniform(-8, 8)
        price = round(fair_value + noise, 1)
        qty = random.randint(1, 5)
        return [
            {"user_id": self.bot_id, "side": side, "price": price, "quantity": qty, "is_bot": True}
        ]

    def _informed_orders(self, fair_value: float) -> list:
        # Informed bot knows ~75% of true value with some error
        error = random.uniform(-0.25, 0.25) * fair_value
        estimated = fair_value + error
        side = "buy" if estimated > fair_value * 0.98 else "sell"
        price = round(estimated + random.uniform(-1, 1), 1)
        qty = random.randint(5, 15)
        return [
            {"user_id": self.bot_id, "side": side, "price": price, "quantity": qty, "is_bot": True}
        ]


class BotManager:
    def __init__(self, num_bots: int):
        self.bots = []
        personalities = ["market_maker", "market_maker", "noise", "noise", "informed"]
        for i in range(num_bots):
            personality = personalities[i % len(personalities)]
            self.bots.append(Bot(f"bot_{i+1}", personality))

    def run_bots(self, true_value: float, book: OrderBook):
        for bot in self.bots:
            # Each bot has slight uncertainty about true value
            noise = random.uniform(-5, 5)
            estimate = true_value + noise
            orders = bot.get_orders(estimate, book)
            for order in orders:
                book.add_order(
                    user_id=order["user_id"],
                    side=order["side"],
                    price=order["price"],
                    quantity=order["quantity"],
                    is_bot=order["is_bot"]
                )