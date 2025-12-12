import React, { useState, useEffect, useContext } from "react";
import "../styles/Blackjack.css";
import { UserContext } from "./UserContext";

const API_BASE = "https://deckofcardsapi.com/api/deck";
const BLACKJACK = 21;
const DEALER_STAND = 17;
const DEAL_DELAY = 1000; // ms between dealer draws

function getHandValue(cards) {
	let total = 0;
	let aces = 0;

	cards.forEach((c) => {
		const v = c.value;
		if (["KING", "QUEEN", "JACK"].includes(v)) total += 10;
		else if (v === "ACE") {
			total += 11;
			aces++;
		} else total += parseInt(v, 10);
	});

	// Convert aces from 11 to 1 as needed to avoid busting
	while (total > BLACKJACK && aces > 0) {
		total -= 10;
		aces--;
	}

	return total;
}

export default function BlackjackPage() {
	const [deckId, setDeckId] = useState(null);
	const [bet, setBet] = useState(0);
	const [inGame, setInGame] = useState(false);
	const [dealerHand, setDealerHand] = useState([]);
	const [playerHands, setPlayerHands] = useState([]);
	const [bets, setBets] = useState([]);
	const [currentHand, setCurrentHand] = useState(0);
	const [message, setMessage] = useState("");
	const [gameOver, setGameOver] = useState(false);
	const [showInsurance, setShowInsurance] = useState(false);
	const [playerBlackjack, setPlayerBlackjack] = useState(false);
	const { user, updateBalance } = useContext(UserContext);

	useEffect(() => {
		// Initialize deck when component mounts
		fetch(`${API_BASE}/new/shuffle/?deck_count=4`)
			.then((r) => r.json())
			.then((data) => setDeckId(data.deck_id))
			.catch((error) =>
				setMessage(error, "Error initializing deck. Please refresh.")
			);
	}, []);

	if (!user) return <p className="loading-message">Loading user info...</p>;

	// Function to update both the local UI balance and the database
	const updateUserBalance = async (newBalance) => {
		// Update local UI state first for immediate feedback
		updateBalance(newBalance);

		// Then update the database
		try {
			const response = await fetch(
				"http://localhost:3000/api/users/updateBalance",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ newBalance }),
				}
			);

			if (!response.ok) {
				console.error("Failed to update balance in database");
				// If database update fails, revert the UI change
				updateBalance(user.balance);
			}
		} catch (error) {
			console.error("Error updating balance:", error);
			// If there's an error, revert the UI change
			updateBalance(user.balance);
		}
	};

	const placeBet = (amt) => {
		if (inGame) return;
		if (amt <= user.balance) {
			setBet((prev) => prev + amt);
			updateUserBalance(user.balance - amt);
		}
	};

	const clearBet = () => {
		if (inGame) return;
		updateUserBalance(user.balance + bet);
		setBet(0);
	};

	const deal = async () => {
		if (!deckId || bet <= 0) return;

		// Reset state for new round
		setDealerHand([]);
		setPlayerHands([]);
		setBets([]);
		setCurrentHand(0);
		setMessage("");
		setGameOver(false);
		setShowInsurance(false);
		setPlayerBlackjack(false);

		try {
			// Draw initial cards first
			const res = await fetch(`${API_BASE}/${deckId}/draw/?count=4`);
			const data = await res.json();

			if (data.success) {
				const { cards } = data;
				const d = [cards[0], cards[2]];
				const p = [[cards[1], cards[3]]];
				setDealerHand(d);
				setPlayerHands(p);
				setBets([bet]);
				setBet(0);

				// Now enter game state (shows cards)
				setInGame(true);

				// Check if dealer is showing an Ace (insurance opportunity)
				if (d[0].value === "ACE") {
					setShowInsurance(true);
					setMessage("Insurance? Dealer is showing an Ace.");
					return; // Wait for insurance decision
				}

				// Check for natural blackjack
				const playerValue = getHandValue([cards[1], cards[3]]);
				if (playerValue === BLACKJACK) {
					setPlayerBlackjack(true);
					setInGame(false); // Show dealer cards immediately

					// Handle blackjack immediately
					const dealerValue = getHandValue(d);
					if (dealerValue === BLACKJACK) {
						// Push
						updateUserBalance(user.balance + bet);
						setMessage(
							"Blackjack! Dealer also has blackjack. Push - bet returned."
						);
					} else {
						// Blackjack pays 3:2
						const blackjackWin = Math.floor(bet * 1.5);
						updateUserBalance(user.balance + bet + blackjackWin);
						setMessage(`Blackjack! You win $${blackjackWin}!`);
					}
					setGameOver(true);
				}
			} else {
				// Handle error - deck might need reshuffling
				const newDeckRes = await fetch(
					`${API_BASE}/new/shuffle/?deck_count=4`
				);
				const newDeckData = await newDeckRes.json();
				setDeckId(newDeckData.deck_id);
				setMessage("New deck created. Please deal again.");
			}
		} catch (error) {
			setMessage(error, "Error dealing cards. Please try again.");
		}
	};

	const placeInsurance = () => {
		const cost = Math.floor(bets[0] / 2);
		if (cost <= user.balance) {
			updateUserBalance(user.balance - cost);
			setShowInsurance(false);
			// check dealer blackjack
			const dealerVal = getHandValue(dealerHand);
			if (dealerVal === BLACKJACK) {
				updateUserBalance(user.balance + cost * 3);
				setMessage(
					"Dealer has blackjack. Insurance pays 2:1. You break even."
				);
				setInGame(false); // Show both dealer cards
				setGameOver(true);
			} else {
				setMessage("Dealer doesn't have blackjack. Insurance lost.");

				// Check for player blackjack after handling insurance
				if (getHandValue(playerHands[0]) === BLACKJACK) {
					setPlayerBlackjack(true);
					setInGame(false); // Show dealer cards
					const blackjackWin = Math.floor(bets[0] * 1.5);
					updateUserBalance(user.balance + bets[0] + blackjackWin);
					setMessage(`Blackjack! You win $${blackjackWin}!`);
					setGameOver(true);
				}
			}
		} else {
			setMessage("Not enough for insurance.");
			setShowInsurance(false);
		}
	};

	const declineInsurance = () => {
		setShowInsurance(false);
		setMessage("");

		// Check for player blackjack after declining insurance
		if (getHandValue(playerHands[0]) === BLACKJACK) {
			setPlayerBlackjack(true);
			setInGame(false); // Show dealer cards
			const blackjackWin = Math.floor(bets[0] * 1.5);
			updateUserBalance(user.balance + bets[0] + blackjackWin);
			setMessage(`Blackjack! You win $${blackjackWin}!`);
			setGameOver(true);
		}
	};

	const hit = async () => {
		if (!inGame || gameOver) return;

		// Check if current hand value is already 21, prevent hitting
		if (getHandValue(playerHands[currentHand]) >= 21) {
			return;
		}

		try {
			const res = await fetch(`${API_BASE}/${deckId}/draw/?count=1`);
			const data = await res.json();

			if (data.success) {
				const { cards } = data;
				const hands = [...playerHands];
				hands[currentHand].push(cards[0]);
				setPlayerHands(hands);

				// Check if player reached exactly 21 or busted
				const handValue = getHandValue(hands[currentHand]);
				if (handValue > BLACKJACK) {
					nextHand();
				} else if (handValue === 21) {
					// Automatically stand when reaching 21
					setTimeout(() => nextHand(), 500); // Short delay to see the card
				}
			} else {
				// Handle error - reshuffling needed
				setMessage("Error drawing card. Please start a new game.");
				setGameOver(true);
			}
		} catch (error) {
			setMessage(error, "Network error. Please try again.");
		}
	};

	const stand = () => {
		if (!inGame || gameOver) return;
		nextHand();
	};

	const doubleDown = async () => {
		if (!inGame || gameOver) return;
		if (
			user.balance < bets[currentHand] ||
			playerHands[currentHand].length !== 2
		)
			return;

		updateUserBalance(user.balance - bets[currentHand]);
		const nb = [...bets];
		nb[currentHand] *= 2;
		setBets(nb);

		await hit();
		nextHand();
	};

	const canSplit = () => {
		if (!inGame || gameOver || playerHands.length === 0) return false;
		const h = playerHands[currentHand];
		return (
			h &&
			h.length === 2 &&
			h[0].value === h[1].value &&
			user.balance >= bets[currentHand]
		);
	};

	const split = async () => {
		if (!canSplit() || gameOver) return;

		try {
			const h = [...playerHands[currentHand]];
			updateUserBalance(user.balance - bets[currentHand]);

			// Create two new hands from the split cards
			const allHands = [...playerHands];
			allHands.splice(currentHand, 1, [h[0]], [h[1]]);

			// Update bets
			const newBets = [...bets];
			newBets.splice(
				currentHand,
				1,
				bets[currentHand],
				bets[currentHand]
			);
			setBets(newBets);

			// Draw additional cards for each new hand
			const res = await fetch(`${API_BASE}/${deckId}/draw/?count=2`);
			const data = await res.json();

			if (data.success) {
				const { cards } = data;
				allHands[currentHand].push(cards[0]);
				allHands[currentHand + 1].push(cards[1]);
				setPlayerHands(allHands);
			} else {
				setMessage("Error drawing cards. Please start a new game.");
				setGameOver(true);
			}
		} catch (error) {
			setMessage(error, "Network error during split. Please try again.");
		}
	};

	const nextHand = () => {
		if (currentHand + 1 < playerHands.length) {
			setCurrentHand((prev) => prev + 1);
		} else {
			// When moving to dealer's turn, flip the hole card immediately
			setInGame(false); // This will reveal the dealer's hole card
			setTimeout(() => {
				dealerPlay();
			}, DEAL_DELAY); // Give a moment to see the flipped card before dealer plays
		}
	};

	const dealerPlay = async () => {
		let dh = [...dealerHand];
		setDealerHand(dh);

		try {
			// Check if all player hands are busted
			const allBusted = playerHands.every(
				(hand) => getHandValue(hand) > BLACKJACK
			);

			// If all player hands busted, dealer doesn't need to draw
			if (!allBusted) {
				// Dealer draws one at a time slower
				while (getHandValue(dh) < DEALER_STAND) {
					await new Promise((r) => setTimeout(r, DEAL_DELAY));
					const res = await fetch(
						`${API_BASE}/${deckId}/draw/?count=1`
					);
					const data = await res.json();

					if (data.success) {
						const { cards } = data;
						dh.push(cards[0]);
						setDealerHand([...dh]);
					} else {
						setMessage(
							"Error during dealer's turn. Game settled with current cards."
						);
						break;
					}
				}
			}

			settle(dh);
		} catch (error) {
			setMessage(
				error,
				"Error during dealer's turn. Game settled with current cards."
			);
			settle(dh);
		}
	};

	const settle = (dh) => {
		const dv = getHandValue(dh);
		let totalWinnings = 0;
		let resultMessage = "";

		playerHands.forEach((ph, i) => {
			const pv = getHandValue(ph);
			const b = bets[i];

			// Skip settlement for blackjack hands since they were already handled
			if (
				playerBlackjack &&
				i === 0 &&
				ph.length === 2 &&
				pv === BLACKJACK
			) {
				return;
			}

			if (pv === BLACKJACK && ph.length === 2) {
				if (playerHands.length === 1) {
					// ORIGINAL hand: natural blackjack pays 3:2
					const blackjackWin = Math.floor(b * 1.5);
					totalWinnings += b + blackjackWin; // get back your bet + 1.5× win
					resultMessage += `Hand ${
						i + 1
					}: Blackjack! Win $${blackjackWin}\n`;
				} else {
					// SPLIT hand: treated as a normal win (1:1)
					totalWinnings += b * 2; // bet + equal win
					resultMessage += `Hand ${
						i + 1
					}: Blackjack on split! Win $${b}\n`;
				}
			}
			// Player busts
			else if (pv > BLACKJACK) {
				resultMessage += `Hand ${i + 1}: Bust! Lose $${b}\n`;
				// No winnings to add (bet is already removed from balance)
			}

			// Dealer busts or player beats dealer
			else if (dv > BLACKJACK || pv > dv) {
				// Win 1:1 - return original bet + equal amount as winnings
				const winnings = b;
				totalWinnings += b + winnings; // Return original bet + winnings
				resultMessage += `Hand ${
					i + 1
				}: Win $${winnings} (bet: $${b})\n`;
			}
			// Push (tie)
			else if (pv === dv) {
				// Bet returned
				totalWinnings += b;
				resultMessage += `Hand ${i + 1}: Push! Bet returned $${b}\n`;
			}
			// Dealer wins
			else {
				resultMessage += `Hand ${i + 1}: Lose $${b}\n`;
				// No winnings to add (bet is already removed from balance)
			}
		});

		// Add the winnings to the balance
		updateUserBalance(user.balance + totalWinnings);

		// Create a more detailed result message
		const betsTotal = bets.reduce((total, b) => total + b, 0);

		if (totalWinnings > 0) {
			const profit = totalWinnings - betsTotal;

			if (profit > 0) {
				setMessage(
					`You win $${profit}!\nTotal returned: $${totalWinnings}\n${resultMessage.trim()}`
				);
			} else {
				setMessage(
					`Your bets are returned: $${totalWinnings}\n${resultMessage.trim()}`
				);
			}
		} else {
			setMessage(`You lose $${betsTotal}!\n${resultMessage.trim()}`);
		}

		// Keep in game state but mark as game over
		// This ensures cards stay visible but no more actions can be taken
		setGameOver(true);
	};

	const startNewGame = () => {
		setGameOver(false);
		setPlayerHands([]);
		setDealerHand([]);
		setBets([]);
		setMessage("");
		setPlayerBlackjack(false);
		setInGame(false);
	};

	return (
		<div className="blackjack-container">
			<div className="blackjack-header">
				<h2>Blackjack</h2>
				<div className="balance-display">
					Balance: ${user.balance.toFixed(2)}
				</div>
			</div>

			{playerHands.length === 0 ? (
				<div className="game-content">
					{bet > 0 && (
						<div className="current-bet">
							Current Bet: ${bet.toFixed(2)}
						</div>
					)}
					<div className="bet-controls">
						{[1, 5, 10, 25, 50, 100].map((v) => (
							<button
								key={v}
								onClick={() => placeBet(v)}
								disabled={v > user.balance || inGame}
								className="bet-chip"
							>
								${v}
							</button>
						))}
						<button
							className="action-button deal-button"
							disabled={bet === 0}
							onClick={deal}
						>
							Deal
						</button>
						{bet > 0 && (
							<button
								className="action-button clear-button"
								onClick={clearBet}
							>
								Clear
							</button>
						)}
					</div>
				</div>
			) : (
				<div className="game-content">
					<div className="game-area">
						<div className="dealer-area">
							<h3 className="hand-label">
								Dealer (
								{getHandValue(
									!inGame || gameOver || playerBlackjack
										? dealerHand
										: [dealerHand[0]]
								)}
								)
							</h3>
							<div className="cards-container">
								{dealerHand.map((c, i) => (
									<div
										key={i}
										className={`card-wrapper ${
											i > 0 ? "card-offset" : ""
										}`}
									>
										<img
											src={
												i === 1 &&
												inGame &&
												!gameOver &&
												!playerBlackjack
													? "https://deckofcardsapi.com/static/img/back.png"
													: c.image
											}
											alt={`${c.value} of ${c.suit}`}
											className="card-image"
										/>
									</div>
								))}
							</div>
						</div>

						{showInsurance && (
							<div className="insurance-options">
								<h4>Insurance Opportunity</h4>
								<p>
									Dealer is showing an Ace. Insurance costs $
									{Math.floor(bets[0] / 2)}
								</p>
								<div className="insurance-buttons">
									<button
										className="action-button insurance-yes"
										onClick={placeInsurance}
									>
										Buy Insurance
									</button>
									<button
										className="action-button insurance-no"
										onClick={declineInsurance}
									>
										No Thanks
									</button>
								</div>
							</div>
						)}

						<div className="player-area">
							{playerHands.map((hand, i) => {
								const handValue = getHandValue(hand);
								const hasBlackjack =
									handValue === BLACKJACK &&
									hand.length === 2;
								const isBusted = handValue > BLACKJACK;

								return (
									<div
										key={i}
										className={`player-hand ${
											i === currentHand &&
											inGame &&
											!gameOver &&
											!showInsurance
												? "active-hand"
												: ""
										} ${isBusted ? "busted-hand" : ""}`}
									>
										<div className="hand-header">
											<span className="hand-label">
												Hand {i + 1}
											</span>
											<span className="hand-bet">
												${bets[i]}
											</span>
											<span className="hand-value">
												{handValue}
												{hasBlackjack && (
													<span className="blackjack-badge">
														BLACKJACK!
													</span>
												)}
												{isBusted && (
													<span className="bust-badge">
														BUST!
													</span>
												)}
											</span>
										</div>

										<div className="cards-container">
											{hand.map((c, j) => (
												<div
													key={j}
													className={`card-wrapper ${
														j > 0
															? "card-offset"
															: ""
													}`}
												>
													<img
														src={c.image}
														alt={`${c.value} of ${c.suit}`}
														className="card-image"
													/>
												</div>
											))}
										</div>

										{i === currentHand &&
											inGame &&
											!gameOver &&
											!showInsurance &&
											!hasBlackjack &&
											!isBusted && (
												<div className="action-buttons">
													<button
														className="action-button hit-button"
														onClick={hit}
													>
														Hit
													</button>
													<button
														className="action-button stand-button"
														onClick={stand}
													>
														Stand
													</button>
													<button
														className="action-button double-button"
														onClick={doubleDown}
														disabled={
															user.balance <
																bets[i] ||
															hand.length !== 2
														}
													>
														Double
													</button>
													<button
														className="action-button split-button"
														onClick={split}
														disabled={!canSplit()}
													>
														Split
													</button>
												</div>
											)}
									</div>
								);
							})}
						</div>
					</div>

					{message && (
						<div className="message-box">
							{message.split("\n").map((line, i) => (
								<p key={i}>{line}</p>
							))}
						</div>
					)}

					{gameOver && (
						<button
							className="action-button new-game-button"
							onClick={startNewGame}
						>
							New Game
						</button>
					)}
				</div>
			)}
			<div className="footer">© 2025 LuckyBet Inc.</div>
		</div>
	);
}
