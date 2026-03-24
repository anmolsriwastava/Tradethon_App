from order_matching import OrderBook
from bot_engine import BotManager

book = OrderBook()
manager = BotManager(10)

# Run bots with true value = 63
manager.run_bots(63, book)

# See order book
snapshot = book.get_book_snapshot()
print("BIDS:")
for b in snapshot["bids"]:
    print("  Price:", b["price"], " Qty:", b["qty"])

print("ASKS:")
for a in snapshot["asks"]:
    print("  Price:", a["price"], " Qty:", a["qty"])

print("Total trades from bots:", len(book.trades))
print("Total positions:", len(book.positions))

pnl = book.calculate_pnl(63)
print("Bot PnLs:")
for user, p in pnl.items():
    print(" ", user, ":", p)