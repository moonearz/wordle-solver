import random
from enum import Enum


class TileColor(Enum):
    GREEN = 1
    YELLOW = 2
    GRAY = 3


def get_feedback(guess: str, answer: str) -> list[TileColor]:
    result = [TileColor.GRAY] * 5
    remaining = list(answer)

    for index, letter in enumerate(guess):
        if letter == answer[index]:
            result[index] = TileColor.GREEN
            remaining[index] = None

    for index, letter in enumerate(guess):
        if result[index] == TileColor.GRAY and letter in remaining:
            result[index] = TileColor.YELLOW
            remaining[remaining.index(letter)] = None

    return result


class WordleGame:
    def __init__(self, answers: list[str], possible_guesses: list[str], answer=None):
        if not answer:
            self.answer = random.choice(answers)
        else:
            self.answer = answer
        self.possible_guesses = possible_guesses
        self.guesses = []

    def is_valid_guess(self, guess: str) -> bool:
        return guess in self.possible_guesses

    def make_guess(self, guess: str) -> list[TileColor]:
        feedback = get_feedback(guess, self.answer)
        self.guesses.append((guess, feedback))
        return feedback

    def is_won(self):
        return any(guess == self.answer for guess, _ in self.guesses)

    def is_over(self):
        return self.is_won() or len(self.guesses) >= 6
