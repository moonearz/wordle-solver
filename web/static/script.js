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

	const response = await fetch("/guess", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			guess: guess,
			feedback: feedback,
		}),
	});

	const data = await response.json();

	console.log("Server response:", data);

	message.textContent =
		`${data.remaining_answers} possible answers remain. ` +
		`Recommended guess: ${data.best_guess.toUpperCase()}`;

	tiles.forEach((tile) => {
		tile.disabled = true;
	});

	const newRow = createGuessRow();

	activeRow.removeChild(submitButton);
	newRow.appendChild(submitButton);

	board.appendChild(newRow);

	newRow.querySelector(".tile").focus();
});
