import React, { useState, useContext } from "react";
import { Wheel } from "react-custom-roulette";
import "../styles/Roulette.css";
import { UserContext } from "./UserContext";
import { useEffect } from "react";

// Define roulette numbers and their properties
const ROULETTE_NUMBERS = [
	{ number: 0, color: "green" },
	{ number: 32, color: "red" },
	{ number: 15, color: "black" },
	{ number: 19, color: "red" },
	{ number: 4, color: "black" },
	{ number: 21, color: "red" },
	{ number: 2, color: "black" },
	{ number: 25, color: "red" },
	{ number: 17, color: "black" },
	{ number: 34, color: "red" },
	{ number: 6, color: "black" },
	{ number: 27, color: "red" },
	{ number: 13, color: "black" },
	{ number: 36, color: "red" },
	{ number: 11, color: "black" },
	{ number: 30, color: "red" },
	{ number: 8, color: "black" },
	{ number: 23, color: "red" },
	{ number: 10, color: "black" },
	{ number: 5, color: "red" },
	{ number: 24, color: "black" },
	{ number: 16, color: "red" },
	{ number: 33, color: "black" },
	{ number: 1, color: "red" },
	{ number: 20, color: "black" },
	{ number: 14, color: "red" },
	{ number: 31, color: "black" },
	{ number: 9, color: "red" },
	{ number: 22, color: "black" },
	{ number: 18, color: "red" },
	{ number: 29, color: "black" },
	{ number: 7, color: "red" },
	{ number: 28, color: "black" },
	{ number: 12, color: "red" },
	{ number: 35, color: "black" },
	{ number: 3, color: "red" },
	{ number: 26, color: "black" },
];

// Prepare wheel data
const wheelData = ROULETTE_NUMBERS.map((item) => ({
	option: item.number.toString(),
	style: {
		backgroundColor: item.color,
		textColor: item.color === "black" ? "white" : "black",
	},
}));

// Define betting options
const BETTING_OPTIONS = {
	NUMBERS: Array.from({ length: 37 }, (_, i) => ({
		value: i.toString(),
		label: i.toString(),
		payout: 35,
	})),
	RED: { value: "red", label: "Red", payout: 1 },
	BLACK: { value: "black", label: "Black", payout: 1 },
	EVEN: { value: "even", label: "Even", payout: 1 },
	ODD: { value: "odd", label: "Odd", payout: 1 },
	FIRST_DOZEN: { value: "1-12", label: "1-12", payout: 2 },
	SECOND_DOZEN: { value: "13-24", label: "13-24", payout: 2 },
	THIRD_DOZEN: { value: "25-36", label: "25-36", payout: 2 },
};

export default function RoulettePage() {
	const [mustSpin, setMustSpin] = useState(false);
	const [prizeNumber, setPrizeNumber] = useState(0);
	const [betType, setBetType] = useState("");
	const [betAmount, setBetAmount] = useState(100);
	const [message, setMessage] = useState("");
	const { user, updateBalance } = useContext(UserContext);
	const [spinResult, setSpinResult] = useState(null);
	const [shouldSpin, setShouldSpin] = useState(false);
	useEffect(() => {
		if (shouldSpin && spinResult) {
			setMustSpin(true);
			setShouldSpin(false);
		}
	}, [shouldSpin, spinResult]);

	// If user context is not loaded yet
	if (!user) return <p>Loading user info...</p>;

	const handleSpin = async () => {
		if (betType === "") {
			setMessage("Please select a bet type");
			return;
		}

		if (betAmount <= 0) {
			setMessage("Bet amount must be greater than 0");
			return;
		}

		if (betAmount > user.balance) {
			setMessage("Not enough balance");
			return;
		}

		setShouldSpin(true);
		setMessage("Spinning...");

		try {
			const response = await fetch(
				"http://localhost:3000/play/roulette",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ betType, amount: betAmount }),
				}
			);

			const data = await response.json();
			if (!response.ok) throw new Error(data.message);

			const result = data.payload.result;
			const resultIndex = wheelData.findIndex(
				(item) => parseInt(item.option) === result
			);
			if (resultIndex === -1)
				throw new Error("Invalid result from server");

			setSpinResult(data.payload);
			setSpinResult(data.payload);
			setPrizeNumber(resultIndex);
			setMustSpin(true);

			console.log("ResultIndex:", resultIndex);
			console.log("Set spinResult:", data.payload);
		} catch (error) {
			console.error("Error playing roulette:", error);
			setMustSpin(false);
			setMessage("An error occurred. Please try again.");
		}
	};

	const renderBettingOptions = () => {
		return (
			<div className="betting-options">
				<div className="bet-groups">
					{["red", "black", "even", "odd"].map((type) => (
						<button
							key={type}
							className={`bet-option ${
								betType === type ? "selected" : ""
							} ${mustSpin ? "disabled" : ""}`}
							onClick={() => !mustSpin && setBetType(type)}
							disabled={mustSpin}
						>
							{type.charAt(0).toUpperCase() + type.slice(1)}
						</button>
					))}
				</div>

				<div className="bet-groups">
					{["1-12", "13-24", "25-36"].map((range) => (
						<button
							key={range}
							className={`bet-option ${
								betType === range ? "selected" : ""
							} ${mustSpin ? "disabled" : ""}`}
							onClick={() => !mustSpin && setBetType(range)}
							disabled={mustSpin}
						>
							{range}
						</button>
					))}
				</div>

				<div className="number-grid">
					<button
						className={`bet-option zero ${
							betType === "0" ? "selected" : ""
						} ${mustSpin ? "disabled" : ""}`}
						onClick={() => !mustSpin && setBetType("0")}
						disabled={mustSpin}
					>
						0
					</button>

					{Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
						<button
							key={num}
							className={`bet-option number ${
								betType === num.toString() ? "selected" : ""
							} ${mustSpin ? "disabled" : ""}`}
							onClick={() =>
								!mustSpin && setBetType(num.toString())
							}
							disabled={mustSpin}
						>
							{num}
						</button>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="roulette-page">
			<div className="roulette-header">
				<h2>Roulette</h2>
				<div className="balance">
					Balance: ${user.balance.toFixed(2)}
				</div>
			</div>

			<div className="roulette-game">
				<div className="wheel-container">
					<Wheel
						mustStartSpinning={mustSpin}
						prizeNumber={prizeNumber}
						data={wheelData}
						outerBorderColor="#fff"
						outerBorderWidth={8}
						innerBorderColor="#000"
						innerBorderWidth={20}
						radiusLineColor="#444"
						radiusLineWidth={1}
						fontSize={17}
						onStopSpinning={() => {
							setMustSpin(false);

							if (!spinResult) {
								setMessage("❌ Spin failed. No result.");
								return;
							}

							const { win, payout, result, newBalance } =
								spinResult;

							updateBalance(newBalance);

							const winnings = win ? payout.toFixed(2) : "0.00";

							setMessage(
								win
									? `🎉 You won $${winnings}! Result: ${result}`
									: `❌ You lost $${betAmount.toFixed(
											2
									  )}. Result: ${result}`
							);

							setBetType("");
							setSpinResult(null); // clean up
						}}
					/>
				</div>

				<div className="betting-panel">
					<div className="bet-amount">
						<label>Bet Amount: $</label>
						<input
							type="number"
							value={betAmount}
							onChange={(e) =>
								setBetAmount(
									Math.max(1, parseInt(e.target.value) || 0)
								)
							}
							disabled={mustSpin}
						/>
					</div>

					<div className="bet-shortcuts">
						{[10, 25, 50, 100, 250, 500].map((amount) => (
							<button
								key={amount}
								onClick={() => setBetAmount(amount)}
								disabled={mustSpin || amount > user.balance}
							>
								${amount}
							</button>
						))}
					</div>

					{renderBettingOptions()}

					<div className="selected-bet">
						{betType && (
							<p>
								Betting on: <strong>{betType}</strong> (
								{BETTING_OPTIONS.NUMBERS.some(
									(opt) => opt.value === betType
								)
									? "35:1"
									: betType === "red" ||
									  betType === "black" ||
									  betType === "even" ||
									  betType === "odd"
									? "1:1"
									: "2:1"}
								)
							</p>
						)}
					</div>

					<button
						className="spin-button"
						onClick={handleSpin}
						disabled={
							mustSpin ||
							!betType ||
							betAmount <= 0 ||
							betAmount > user.balance
						}
					>
						{mustSpin ? "Spinning..." : "Spin"}
					</button>

					{message && <p className="message">{message}</p>}
				</div>
			</div>
		</div>
	);
}
