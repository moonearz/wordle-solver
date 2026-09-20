const tiles = document.querySelectorAll(".tile");
const states = ["absent", "present", "correct"];

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

const submitButton = document.querySelector("#submit-guess");
const message = document.querySelector("#message");

submitButton.addEventListener("click", async () => {
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
});
