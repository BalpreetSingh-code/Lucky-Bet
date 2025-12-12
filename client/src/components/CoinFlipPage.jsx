// File: client/src/CoinFlipPage.jsx
import React, { useState, useRef, useContext } from "react";
import "../styles/CoinFlip.css";
import { UserContext } from "./UserContext";

const HEADS_URL =
	"https://www.pngkey.com/png/detail/146-1464786_400px-circle-quarter-heads-side-of-coin.png";
const TAILS_URL =
	"https://www.pngkey.com/png/detail/146-1464856_standing-liberty-quarter-type2m-1926-reverse-tails-on.png";

export default function CoinFlipPage() {
	const [choice, setChoice] = useState(null);
	const [flipping, setFlipping] = useState(false);
	const [result, setResult] = useState(null);
	const [bet, setBet] = useState(0);
	const coinRef = useRef(null);
	const { user, updateBalance } = useContext(UserContext);

	if (!user) return <p>Loading user info...</p>;

	const tossCoin = async () => {
		if (!choice || bet <= 0 || flipping) return;
		setFlipping(true);
		setResult(null);

		try {
			const res = await fetch("http://localhost:3000/play/coinflip", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					guess: choice.toLowerCase(),
					amount: bet,
				}),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message);

			const outcome = data.payload.outcome;
			const url = outcome === "heads" ? HEADS_URL : TAILS_URL;

			if (coinRef.current) {
				coinRef.current.classList.add("flip");
				setTimeout(() => {
					coinRef.current.innerHTML = `<img src="${url}" alt="${outcome}" />`;
					coinRef.current.classList.remove("flip");
				}, 1000);
			}

			setTimeout(() => {
				updateBalance(data.payload.newBalance);
				setResult(
					`It's ${outcome.toUpperCase()}. You ${
						data.payload.win
							? `win $${data.payload.payout.toFixed(2)}!`
							: "lose!"
					}`
				);
				setFlipping(false);
				setChoice(null);
				setBet(0);
			}, 1500);
		} catch (err) {
			console.error("Coin flip failed:", err);
			setResult("Something went wrong.");
			setFlipping(false);
		}
	};

	const placeBet = (amt) => {
		if (amt <= user.balance && !flipping) {
			setBet((prev) => prev + amt);
		}
	};

	const clearBet = () => {
		setBet(0);
	};

	return (
		<div className="coinflip-page">
			<div className="coinflip-header">
				<h2>COIN FLIP</h2>
				<div className="balance">
					Balance: ${user.balance.toFixed(2)}
				</div>
			</div>

			<div className="coin" ref={coinRef}>
				<img src={TAILS_URL} alt="Tails" />
			</div>

			<div className="choice-buttons">
				{["Heads", "Tails"].map((side) => (
					<button
						key={side}
						disabled={flipping}
						className={choice === side ? "selected" : ""}
						onClick={() => setChoice(side)}
					>
						{side.toUpperCase()}
					</button>
				))}
			</div>

			<div className="bet-controls-coin">
				{[1, 5, 10, 25, 50, 100].map((v) => (
					<button
						key={v}
						onClick={() => placeBet(v)}
						disabled={v > user.balance || flipping}
					>
						${v}
					</button>
				))}
				{bet > 0 && <button onClick={clearBet}>Clear Bet</button>}
			</div>

			<div className="bet-display">Current Bet: ${bet}</div>

			<button
				id="toss-button"
				onClick={tossCoin}
				disabled={flipping || !choice || bet <= 0}
			>
				{flipping ? "Flipping…" : "TOSS COIN"}
			</button>

			{result && <p className="result">{result}</p>}
		</div>
	);
}
