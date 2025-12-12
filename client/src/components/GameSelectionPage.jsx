/**
 * Game Selection Page Component
 *
 * The main navigation hub for the LuckyBet casino application. This component
 * displays all available games in an interactive grid layout, allowing users
 * to select and navigate to their preferred game.
 *
 * Features:
 * - Responsive game grid with visual game cards
 * - Click-to-navigate functionality for each game
 * - Game preview images with consistent styling
 * - Branded header with casino name
 * - Route-based navigation using React Router
 *
 * Design Pattern:
 * - Uses a data-driven approach with games array
 * - Implements card-based UI for game selection
 * - Provides visual feedback through hover states (via CSS)
 *
 * @component
 * @author LuckyBet Inc.
 * @version 1.0.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";

/**
 * Main Game Selection Component
 *
 * Renders the casino's game selection interface as the primary navigation
 * point for users. Each game is presented as an interactive card with
 * preview image and title.
 *
 * Navigation Flow:
 * 1. User lands on game selection page
 * 2. Sees available games in grid layout
 * 3. Clicks on desired game card
 * 4. Navigates to specific game route
 *
 * @returns {JSX.Element} The game selection page interface
 */
export default function GameSelectionPage() {
	// ===================
	// NAVIGATION SETUP
	// ===================

	/**
	 * React Router navigation hook for programmatic routing
	 * Used to navigate to selected game routes
	 */
	const navigate = useNavigate();

	// ===================
	// GAME CONFIGURATION
	// ===================

	/**
	 * Available games configuration array
	 *
	 * Each game object contains:
	 * @property {string} name - Display name for the game
	 * @property {string} route - React Router path to game component
	 * @property {string} img - Relative path to game preview image
	 *
	 * Image Path Convention:
	 * - Images stored in public directory (../../ from src)
	 * - Consistent naming: GAMENAME.png format
	 * - Optimized for card display (square/rectangular format)
	 *
	 * Route Convention:
	 * - All game routes follow /play/{gamename} pattern
	 * - Lowercase game names in URLs
	 * - Corresponds to component routing in App.js
	 */
	const games = [
		{
			name: "Roulette",
			route: "/play/roulette",
			img: "../../ROULETTE.png",
		},
		{
			name: "Blackjack",
			route: "/play/blackjack",
			img: "../../BJ.png",
		},
		{
			name: "Coin Flip",
			route: "/play/coinflip",
			img: "../../COINFLIP.png",
		},
	];

	// ===================
	// EVENT HANDLERS
	// ===================

	/**
	 * Handles game card click events
	 * Navigates user to the selected game's route
	 *
	 * @param {string} route - The target route path for the selected game
	 * @returns {void}
	 *
	 * @example
	 * handleGameSelect('/play/blackjack') // Navigates to Blackjack game
	 */
	const handleGameSelect = (route) => {
		navigate(route);
	};

	// ===================
	// RENDER COMPONENT
	// ===================

	return (
		<div className="selection">
			{/* Casino branding header */}
			<h1>LUCKYBET</h1>

			{/* Games grid container */}
			<div className="games">
				{games.map((g) => (
					/**
					 * Individual game card component
					 *
					 * Features:
					 * - Click handler for navigation
					 * - Game preview image with consistent styling
					 * - Game name display
					 * - Responsive layout via CSS grid
					 *
					 * Accessibility:
					 * - Alt text for images
					 * - Semantic structure
					 * - Keyboard navigation support (via CSS focus states)
					 *
					 * Styling:
					 * - 100% width images for consistent card sizing
					 * - Border radius for modern appearance
					 * - Hover effects defined in CSS
					 */
					<div
						key={g.name}
						className="game-card"
						onClick={() => handleGameSelect(g.route)}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							// Support keyboard navigation (Enter/Space)
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleGameSelect(g.route);
							}
						}}
						aria-label={`Play ${g.name}`}
					>
						{/* Game preview image */}
						<img
							src={g.img}
							alt={`${g.name} game preview`}
							style={{
								width: "100%",
								borderRadius: 4,
							}}
						/>

						{/* Game title */}
						<h3>{g.name}</h3>
					</div>
				))}
			</div>
		</div>
	);
}
