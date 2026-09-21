from flask import Flask, jsonify, render_template, request

from wordle_solver.solver import Solver

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/guess", methods=["POST"])
def submit_guess():
    data = request.get_json()
    history = data["history"]

    feedback_map = {
        "absent": "x",
        "present": "y",
        "correct": "g",
    }

    def apply_history(solver):
        for turn in history:
            guess = turn["guess"].lower()
        feedback = "".join(feedback_map[state] for state in turn["feedback"])
        solver.update(guess, feedback)

    solver = Solver()
    apply_history(solver)

    using_fallback = False

    if not solver.possible_answers:
        solver = Solver.from_all_words()
        apply_history(solver)
        using_fallback = True

    for turn in history:
        guess = turn["guess"].lower()
        feedback = "".join(feedback_map[state] for state in turn["feedback"])

        solver.update(guess, feedback)

    return jsonify(
        {
            "remaining_answers": solver.possible_answers,
            "answer_guesses": solver.best_possible_answers(10),
            "entropy_guesses": solver.best_non_answers(10),
            "using_fallback": using_fallback,
        }
    )
