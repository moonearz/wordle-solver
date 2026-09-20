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

    solver = Solver()

    feedback_map = {
        "absent": "x",
        "present": "y",
        "correct": "g",
    }

    for turn in history:
        guess = turn["guess"].lower()
        feedback = "".join(feedback_map[state] for state in turn["feedback"])

        solver.update(guess, feedback)

    return jsonify(
        {
            "remaining_answers": solver.remaining_answers,
            "best_guess": solver.best_guess(),
        }
    )
