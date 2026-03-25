import google.generativeai as genai
import json
import random
import os
from dotenv import load_dotenv

load_dotenv()

FALLBACK_PUZZLES = [
    {
        "title": "Biased Coin",
        "description": "A coin has 60% chance of heads. You win 100 on heads, lose 100 on tails. What is the fair value of playing this game?",
        "true_fair_value": 20,
        "hint_1": "Think about expected value: probability × outcome for each side",
        "hint_2": "EV = 0.6 × 100 + 0.4 × (-100) = 60 - 40 = 20"
    },
    {
        "title": "Dice Game",
        "description": "You roll a fair 6-sided die. You receive 10 × the number shown. What is the fair price to play?",
        "true_fair_value": 35,
        "hint_1": "Calculate the average payout across all outcomes",
        "hint_2": "EV = 10 × (1+2+3+4+5+6)/6 = 10 × 3.5 = 35"
    },
    {
        "title": "Card Draw",
        "description": "A card is drawn from a standard 52-card deck. You win 200 if it is a face card (J/Q/K), otherwise you win 0. What is the fair price?",
        "true_fair_value": 46,
        "hint_1": "How many face cards are in a deck?",
        "hint_2": "12 face cards out of 52. EV = (12/52) × 200 = 46.15"
    },
    {
        "title": "Weighted Dice",
        "description": "A loaded die shows 6 with probability 1/3 and each other number with probability 2/15. You win 60 for a 6, 10 for anything else. Fair value?",
        "true_fair_value": 28,
        "hint_1": "Split into two cases: rolling a 6 vs not rolling a 6",
        "hint_2": "EV = (1/3)×60 + (2/3)×10 = 20 + 6.67 = 26.67"
    },
    {
        "title": "Urn Problem",
        "description": "An urn has 7 red and 3 blue balls. Draw one ball. Win 100 for red, 0 for blue. What is the fair price?",
        "true_fair_value": 70,
        "hint_1": "What is the probability of drawing red?",
        "hint_2": "P(red) = 7/10 = 0.7. EV = 0.7 × 100 = 70"
    }
]


def generate_puzzle_with_gemini() -> dict:
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise Exception("No API key found")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """Generate a probability trading puzzle for a quantitative finance game.

Return ONLY a JSON object with no extra text, no markdown, no backticks:
{
    "title": "short title",
    "description": "puzzle description with all numbers needed to solve it",
    "true_fair_value": number between 20 and 150,
    "hint_1": "first hint without giving away answer",
    "hint_2": "second hint with the calculation shown"
}

Rules:
- Must be solvable using expected value calculation
- Involve dice, cards, coins, urns, or simple probability
- true_fair_value must be mathematically correct
- Keep description under 60 words"""
        
        response = model.generate_content(prompt)
        raw = response.text.strip()
        
        # Clean up response if it has markdown
        if raw.startswith("```json"):
            raw = raw.split("```json")[1]
        if raw.startswith("```"):
            raw = raw.split("```")[1]
        if raw.endswith("```"):
            raw = raw[:-3]
        
        puzzle = json.loads(raw)
        return puzzle
        
    except Exception as e:
        print(f"Gemini API failed, using fallback puzzle: {e}")
        return random.choice(FALLBACK_PUZZLES)


def get_puzzle() -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("No API key found, using fallback puzzle")
        return random.choice(FALLBACK_PUZZLES)
    return generate_puzzle_with_gemini()