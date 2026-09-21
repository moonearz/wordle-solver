import json
import math
from collections import Counter
from pathlib import Path

from .game import TileColor, get_feedback

DATA_DIR = Path(__file__).parent / "data"
with (DATA_DIR / "wordles.json").open() as f:
    answers = json.load(f)

with (DATA_DIR / "nonwordles.json").open() as f:
    guesses = json.load(f)


def convert_feedback(feedback: list[TileColor]) -> str:
    chars = []
    for tile in feedback:
        if tile == TileColor.GREEN:
            chars.append("g")
        elif tile == TileColor.YELLOW:
            chars.append("y")
        else:
            chars.append("x")

    return "".join(chars)


class Solver:
    def __init__(self, possible_answers=None, use_cache=True):
        if possible_answers is None:
            self.possible_answers = answers.copy()
        else:
            self.possible_answers = possible_answers.copy()
            use_cache = False

        self.possible_guesses = list(set(guesses + answers))
        if use_cache:
            with (DATA_DIR / "initial_rankings_all.json").open() as f:
                self.initial_rankings_all = [tuple(x) for x in json.load(f)]

            with (DATA_DIR / "initial_rankings_answers.json").open() as f:
                self.initial_rankings_answers = [tuple(x) for x in json.load(f)]

        else:
            self.initial_rankings_answers = None
            self.initial_rankings_all = None

    @property
    def remaining_answers(self):
        return len(self.possible_answers)

    @property
    def answers(self):
        return self.possible_answers

    def get_entropy(self, guess: str) -> float:
        if not self.possible_answers:
            return 0.0

        feedback_counter = Counter()
        for candidate in self.possible_answers:
            feedback = convert_feedback(get_feedback(guess, candidate))
            feedback_counter[feedback] += 1

        entropy = 0
        for _, count in feedback_counter.items():
            prob = count / len(self.possible_answers)
            entropy -= prob * math.log2(prob)

        return entropy

    def update(self, guess: str, feedback: str) -> None:
        self.possible_answers = [
            answer
            for answer in self.possible_answers
            if convert_feedback(get_feedback(guess, answer)) == feedback
        ]

    def best_guess(self) -> str:
        return self.best_guesses(1)[0][0]

    def best_guesses(self, n=10) -> list[tuple[str, float]]:
        if len(self.possible_answers) == 1:
            return [(self.possible_answers[0], 0.0)]

        if len(self.possible_answers) == len(answers) and self.initial_rankings_all:
            return self.initial_rankings_all[:n]

        scores = []
        for guess in self.possible_guesses:
            entropy = self.get_entropy(guess)
            scores.append((guess, entropy))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:n]

    def best_possible_answer(self) -> str:
        return self.best_possible_answers(1)[0][0]

    def best_possible_answers(self, n=10) -> list[tuple[str, float]]:
        if len(self.possible_answers) == 1:
            return [(self.possible_answers[0], 0.0)]

        if len(self.possible_answers) == len(answers) and self.initial_rankings_answers:
            return self.initial_rankings_answers[:n]

        scores = []

        for answer in self.possible_answers:
            entropy = self.get_entropy(answer)
            scores.append((answer, entropy))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:n]


def best_non_answers(self, n=10) -> list[tuple[str, float]]:
    scores = []

    for guess in self.possible_guesses:
        if guess in self.possible_answers:
            continue

        entropy = self.get_entropy(guess)
        scores.append((guess, entropy))

    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:n]
