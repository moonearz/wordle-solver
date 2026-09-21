const guessHistory = [];
const tiles = document.querySelectorAll(".tile");
setupTiles(tiles);
const states = ["absent", "present", "correct"];
const board = document.querySelector("#guess-board");

function createGuessRow() {
	const row = document.createElement("div");
	row.classList.add("guess-row");

	for (let i = 0; i < 5; i++) {
		const tile = document.createElement("input");

		tile.classList.add("tile");
		tile.maxLength = 1;
		tile.setAttribute("aria-label", `Letter ${i + 1}`);

		row.appendChild(tile);
	}
	const tiles = row.querySelectorAll(".tile");
	setupTiles(tiles);

	return row;
}

function setupTiles(tiles) {
	tiles.forEach((tile, index) => {
		tile.addEventListener("input", () => {
			tile.value = tile.value.toUpperCase();

			if (tile.value && index < tiles.length - 1) {
				tiles[index + 1].focus();
			}
		});

		tile.addEventListener("keydown", (event) => {
			if (
				event.key === "Backspace" &&
				tile.value === "" &&
				index > 0
			) {
				tiles[index - 1].focus();
			}
		});

		tile.addEventListener("click", () => {
			if (!tile.value) {
				return;
			}

			const currentState = tile.dataset.state;
			const currentIndex = states.indexOf(currentState);
			const nextIndex = (currentIndex + 1) % states.length;
			const nextState = states[nextIndex];

			tile.classList.remove(...states);
			tile.classList.add(nextState);
			tile.dataset.state = nextState;
		});
	});
}

const submitButton = document.querySelector("#submit-guess");
const message = document.querySelector("#message");

submitButton.addEventListener("click", async () => {
	const activeRow = board.lastElementChild;
	const tiles = activeRow.querySelectorAll(".tile");

	const guess = Array.from(tiles)
		.map((tile) => tile.value)
		.join("");

	const feedback = Array.from(tiles)
		.map((tile) => tile.dataset.state);

	console.log("Guess:", guess);
	console.log("Feedback:", feedback);

	if (guess.length !== 5) {
		message.textContent = "Enter all five letters.";
		return;
	}

	if (feedback.some((state) => !state)) {
		message.textContent = "Set the feedback for every letter.";
		return;
	}

	guessHistory.push({
		guess: guess,
		feedback: feedback,
	});

	const response = await fetch("/guess", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			history: guessHistory,	
		}),
	});

	const data = await response.json();
	const answerGuesses = document.querySelector("#answer-guesses");
	answerGuesses.innerHTML = "";
	data.answer_guesses.forEach(([word, entropy]) => {
		const item = document.createElement("p");
		item.textContent = `${word.toUpperCase()} (${entropy.toFixed(2)})`;
		answerGuesses.appendChild(item);
	});
	const entropyGuesses = document.querySelector("#entropy-guesses");

	entropyGuesses.innerHTML = "";

	data.entropy_guesses.forEach(([word, entropy]) => {
		const item = document.createElement("p");
		item.textContent = `${word.toUpperCase()} (${entropy.toFixed(2)})`;
		entropyGuesses.appendChild(item);
	});

	const remainingSummary = document.querySelector("#remaining-summary");

	if (data.using_fallback) {
		remainingSummary.textContent =
			`${data.remaining_answers.length} matches from full word list`;
	} else {
		remainingSummary.textContent =
			`${data.remaining_answers.length} possible answers`;
	}
	const remainingAnswerList = document.querySelector(
		"#remaining-answer-list"
	);
	remainingAnswerList.innerHTML = "";

	data.remaining_answers.forEach((word) => {
		const item = document.createElement("p");
		item.textContent = word.toUpperCase();
		remainingAnswerList.appendChild(item);
	});
	console.log("Server response:", data);

	tiles.forEach((tile) => {
		tile.disabled = true;
	});

	const newRow = createGuessRow();

	activeRow.removeChild(submitButton);
	newRow.appendChild(submitButton);

	board.appendChild(newRow);

	newRow.querySelector(".tile").focus();
});
