import json
from pathlib import Path

from wordle_solver.solver import Solver

DATA_DIR = Path(__file__).parents[1] / "src" / "wordle_solver" / "data"

solver = Solver(use_cache=False)

rankings_answers = solver.best_possible_answers(len(solver.possible_answers))
rankings_all = solver.best_guesses(len(solver.possible_guesses))

with (DATA_DIR / "initial_rankings_answers.json").open("w") as f:
    json.dump(rankings_answers, f, indent=2)

with (DATA_DIR / "initial_rankings_all.json").open("w") as f:
    json.dump(rankings_all, f, indent=2)

print("Updated first guess cache")
