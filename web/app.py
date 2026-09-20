from flask import Flask, jsonify, render_template, request

from wordle_solver.solver import Solver

app = Flask(__name__)

solver = Solver()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/guess", methods=["POST"])
def submit_guess():
    data = request.get_json()

    guess = data["guess"].lower()
    feedback = data["feedback"]

    feedback_map = {
        "absent": "x",
        "present": "y",
        "correct": "g",
    }

    feedback_string = "".join(feedback_map[state] for state in feedback)

    solver.update(guess, feedback_string)

    return jsonify(
        {
            "remaining_answers": solver.remaining_answers,
            "best_guess": solver.best_guess(),
        }
    )
