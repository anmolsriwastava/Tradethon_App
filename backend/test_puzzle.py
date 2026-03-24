from puzzle_engine import get_puzzle

print("Generating puzzle...")
puzzle = get_puzzle()

print("\n--- PUZZLE ---")
print("Title:", puzzle["title"])
print("Description:", puzzle["description"])
print("True Fair Value:", puzzle["true_fair_value"])
print("Hint 1:", puzzle["hint_1"])
print("Hint 2:", puzzle["hint_2"])