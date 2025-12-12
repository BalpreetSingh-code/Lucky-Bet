/**
 * Leaderboard Component
 *
 * Displays a ranked list of casino players based on their account balances.
 * Features real-time data fetching, loading states, error handling, and
 * formatted display with special recognition for top performers.
 *
 * Features:
 * - Real-time leaderboard data from server API
 * - Ranked display with medal icons for top 3 players
 * - Formatted currency display using Intl.NumberFormat
 * - Loading states with spinner animation
 * - Error handling with retry functionality
 * - Empty state handling for no data scenarios
 * - Responsive design with player information cards
 *
 * API Integration:
 * - Fetches from GET /leaderboard endpoint
 * - Expects array of player objects with id, username, email, balance
 * - Includes credentials for authenticated requests
 *
 * Ranking System:
 * - Players ranked by account balance (highest to lowest)
 * - Top 3 receive special visual treatment (medals)
 * - Remaining players show numerical rank
 *
 * @component
 * @author LuckyBet Inc.
 * @version 1.0.0
 */

// File: client/src/components/Leaderboard.jsx
import React, { useState, useEffect } from "react";
import "../styles/Leaderboard.css";

/**
 * Main Leaderboard Component
 *
 * Manages the complete leaderboard display including data fetching,
 * state management, and rendering of ranked player information.
 * Handles all loading, error, and empty states gracefully.
 *
 * @returns {JSX.Element} The complete leaderboard interface
 */
export default function Leaderboard() {
	// ===================
	// STATE DECLARATIONS
	// ===================

	/**
	 * @type {Array<Object>} Array of player objects from leaderboard API
	 * Each player object contains: { id, username, email, balance }
	 */
	const [leaderboardData, setLeaderboardData] = useState([]);

	/**
	 * @type {boolean} Loading state indicator for API requests
	 */
	const [loading, setLoading] = useState(true);

	/**
	 * @type {string|null} Error message if API request fails
	 */
	const [error, setError] = useState(null);

	// ===================
	// LIFECYCLE EFFECTS
	// ===================

	/**
	 * Fetch leaderboard data on component mount
	 * Automatically loads the latest ranking data when component initializes
	 */
	useEffect(() => {
		fetchLeaderboard();
	}, []);

	// ===================
	// API FUNCTIONS
	// ===================

	/**
	 * Fetches leaderboard data from the server API
	 *
	 * Process:
	 * 1. Sets loading state to true
	 * 2. Makes authenticated GET request to leaderboard endpoint
	 * 3. Processes response and updates state accordingly
	 * 4. Handles both success and error scenarios
	 * 5. Always clears loading state when complete
	 *
	 * API Contract:
	 * - Endpoint: GET /leaderboard
	 * - Authentication: Required (credentials: include)
	 * - Response: { payload: Array<PlayerObject> }
	 * - PlayerObject: { id, username, email, balance }
	 *
	 * Error Handling:
	 * - Network errors: Connection issues, timeout
	 * - HTTP errors: 4xx/5xx response codes
	 * - Data errors: Missing or malformed payload
	 *
	 * @async
	 * @returns {Promise<void>}
	 *
	 * @example
	 * fetchLeaderboard(); // Loads fresh leaderboard data
	 */
	const fetchLeaderboard = async () => {
		try {
			setLoading(true);
			setError(null); // Clear previous errors

			const response = await fetch("http://localhost:3000/leaderboard", {
				method: "GET",
				credentials: "include", // Include session cookies for authentication
			});

			const data = await response.json();

			if (response.ok) {
				// Success: Update leaderboard data
				setLeaderboardData(data.payload || []);
			} else {
				// HTTP error: Display server error message
				setError(data.message || "Failed to fetch leaderboard");
			}
		} catch (err) {
			// Network/parsing error: Display generic error
			console.error("Leaderboard fetch error:", err);
			setError("Error connecting to server");
		} finally {
			// Always clear loading state
			setLoading(false);
		}
	};

	// ===================
	// UTILITY FUNCTIONS
	// ===================

	/**
	 * Returns appropriate rank display for player position
	 *
	 * Visual Ranking System:
	 * - 1st place: Gold medal emoji (🥇)
	 * - 2nd place: Silver medal emoji (🥈)
	 * - 3rd place: Bronze medal emoji (🥉)
	 * - 4th+ place: Numerical rank (#4, #5, etc.)
	 *
	 * @param {number} rank - Player's rank position (1-based)
	 * @returns {string} Formatted rank display (emoji or #number)
	 *
	 * @example
	 * getRankIcon(1); // Returns "🥇"
	 * getRankIcon(4); // Returns "#4"
	 */
	const getRankIcon = (rank) => {
		switch (rank) {
			case 1:
				return "🥇"; // Gold medal for 1st place
			case 2:
				return "🥈"; // Silver medal for 2nd place
			case 3:
				return "🥉"; // Bronze medal for 3rd place
			default:
				return `#${rank}`; // Numerical rank for 4th+ place
		}
	};

	/**
	 * Formats balance amount as localized currency
	 *
	 * Uses Intl.NumberFormat for consistent, localized currency display:
	 * - Currency: USD ($)
	 * - Locale: en-US (American English)
	 * - Includes currency symbol and proper comma separators
	 * - Handles decimal places automatically
	 *
	 * @param {number} balance - Raw balance amount in dollars
	 * @returns {string} Formatted currency string
	 *
	 * @example
	 * formatBalance(1234.56); // Returns "$1,234.56"
	 * formatBalance(1000000);  // Returns "$1,000,000.00"
	 */
	const formatBalance = (balance) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(balance);
	};

	// ===================
	// CONDITIONAL RENDERS
	// ===================

	/**
	 * Loading State Render
	 * Shows spinner animation and loading message while fetching data
	 */
	if (loading) {
		return (
			<div className="leaderboard-content">
				<div className="loading">
					{/* CSS-animated spinner for visual feedback */}
					<div className="spinner"></div>
					<p>Loading leaderboard...</p>
				</div>
			</div>
		);
	}

	/**
	 * Error State Render
	 * Displays error message with retry functionality when API fails
	 */
	if (error) {
		return (
			<div className="leaderboard-content">
				<div className="error">
					<p>❌ {error}</p>
					{/* Retry button to attempt data fetch again */}
					<button onClick={fetchLeaderboard} className="retry-btn">
						Try Again
					</button>
				</div>
			</div>
		);
	}

	/**
	 * Empty State Render
	 * Shows message when no players exist in the system
	 */
	if (leaderboardData.length === 0) {
		return (
			<div className="leaderboard-content">
				<div className="no-data">
					<p>No players found</p>
				</div>
			</div>
		);
	}

	// ===================
	// MAIN RENDER
	// ===================

	/**
	 * Main Leaderboard Render
	 * Displays the complete ranked list of players with their information
	 */
	return (
		<div className="leaderboard-content">
			<div className="leaderboard-list">
				{leaderboardData.map((player, index) => {
					// Calculate rank (index is 0-based, rank is 1-based)
					const rank = index + 1;
					const isTopThree = rank <= 3;

					return (
						/**
						 * Individual Player Card
						 *
						 * Features:
						 * - Unique key for React optimization
						 * - Special styling for top 3 players
						 * - Rank display with icons/numbers
						 * - Player information (name, email)
						 * - Formatted balance display
						 *
						 * Layout Structure:
						 * - Left: Rank indicator
						 * - Center: Player info (name + email)
						 * - Right: Balance amount
						 */
						<div
							key={player.id || index} // Prefer unique ID, fallback to index
							className={`leaderboard-item ${
								isTopThree ? "top-three" : ""
							}`}
						>
							{/* Rank display section */}
							<div className="rank">{getRankIcon(rank)}</div>

							{/* Player information section */}
							<div className="player-info">
								<div className="player-name">
									{player.username || "Anonymous"}
								</div>
								<div className="player-email">
									{player.email}
								</div>
							</div>

							{/* Balance display section */}
							<div className="player-balance">
								{formatBalance(player.balance)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
