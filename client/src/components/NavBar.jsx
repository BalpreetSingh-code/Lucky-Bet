/**
 * Navigation Bar Component
 *
 * A responsive navigation header for the LuckyBet casino application that
 * adapts its content based on user authentication status and current page.
 * Provides core navigation functionality, user profile access, and leaderboard
 * display in a modal interface.
 *
 * Features:
 * - Context-aware navigation (authenticated vs unauthenticated)
 * - User profile icon with initial letter display
 * - Modal-based leaderboard with backdrop dismissal
 * - Responsive design with center and edge positioning
 * - Page-aware content hiding (auth pages vs app pages)
 * - Click-outside-to-close modal functionality
 * - Branded logo with navigation to games page
 *
 * Navigation States:
 * - Unauthenticated: Shows Login/Register links
 * - Authenticated (app pages): Shows profile icon and leaderboard button
 * - Auth pages: Minimal display with just logo and auth links
 *
 * User Experience:
 * - Profile icon shows user's name/email initial
 * - Leaderboard accessible via trophy button
 * - Modal overlay for non-intrusive leaderboard viewing
 * - Consistent branding across all pages
 *
 * @component
 * @author LuckyBet Inc.
 * @version 1.0.0
 */

// File: client/src/components/NavBar.jsx
import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import Leaderboard from "./LeaderBoard";
import "../styles/NavBar.css";

/**
 * Main Navigation Bar Component
 *
 * Renders a responsive navigation header that adapts its content based on
 * user authentication status and current page location. Manages modal
 * display for leaderboard and provides seamless navigation throughout
 * the application.
 *
 * @returns {JSX.Element} The complete navigation bar with conditional content
 */
export default function NavBar() {
	// ===================
	// CONTEXT & HOOKS
	// ===================

	/**
	 * Current authenticated user data from UserContext
	 * Contains user profile information (name, email, balance, etc.)
	 */
	const { user } = useContext(UserContext);

	/**
	 * Current route location for conditional navigation rendering
	 * Used to determine if user is on auth pages vs app pages
	 */
	const location = useLocation();

	/**
	 * Navigation hook for programmatic routing
	 * Used for profile page navigation
	 */
	const navigate = useNavigate();

	// Debug logging for development
	console.log("🥷 NavBar sees user:", user);

	// ===================
	// STATE DECLARATIONS
	// ===================

	/**
	 * @type {boolean} Controls leaderboard modal visibility
	 */
	const [showLeaderboard, setShowLeaderboard] = useState(false);

	// ===================
	// COMPUTED VALUES
	// ===================

	/**
	 * Determines if current page is an authentication page
	 * Used to conditionally hide/show navigation elements
	 *
	 * @type {boolean} True if on login or register page
	 */
	const isAuthPage =
		location.pathname === "/login" || location.pathname === "/register";

	// ===================
	// EVENT HANDLERS
	// ===================

	/**
	 * Toggles leaderboard modal visibility
	 * Provides open/close functionality for the leaderboard overlay
	 *
	 * @returns {void}
	 *
	 * @example
	 * toggleLeaderboard(); // Opens modal if closed, closes if open
	 */
	const toggleLeaderboard = () => {
		setShowLeaderboard(!showLeaderboard);
	};

	/**
	 * Navigates user to their profile page
	 * Programmatically routes to /profile when profile icon is clicked
	 *
	 * @returns {void}
	 *
	 * @example
	 * goToProfile(); // Navigates to /profile route
	 */
	const goToProfile = () => {
		navigate("/profile");
	};

	/**
	 * Handles modal backdrop clicks to close leaderboard
	 * Closes modal when user clicks outside the modal content area
	 *
	 * @param {React.MouseEvent} e - Click event from backdrop
	 * @returns {void}
	 */
	const handleBackdropClick = (e) => {
		// Only close if clicking the backdrop itself, not modal content
		if (e.target === e.currentTarget) {
			toggleLeaderboard();
		}
	};

	/**
	 * Prevents modal content clicks from closing the modal
	 * Stops event propagation when clicking inside modal content
	 *
	 * @param {React.MouseEvent} e - Click event from modal content
	 * @returns {void}
	 */
	const handleModalContentClick = (e) => {
		e.stopPropagation();
	};

	// ===================
	// UTILITY FUNCTIONS
	// ===================

	/**
	 * Generates user's initial letter for profile icon display
	 *
	 * Priority Order:
	 * 1. First letter of user's name (if available)
	 * 2. First letter of user's email (if name not available)
	 * 3. Default "U" (if neither name nor email available)
	 *
	 * @returns {string} Single uppercase letter for profile icon
	 *
	 * @example
	 * // User with name "John Doe"
	 * getUserInitial(); // Returns "J"
	 *
	 * // User with only email "alice@example.com"
	 * getUserInitial(); // Returns "A"
	 *
	 * // User with no name or email
	 * getUserInitial(); // Returns "U"
	 */
	const getUserInitial = () => {
		if (user?.name) {
			return user.name.charAt(0).toUpperCase();
		}
		if (user?.email) {
			return user.email.charAt(0).toUpperCase();
		}
		return "U"; // Default fallback for edge cases
	};

	// ===================
	// RENDER COMPONENT
	// ===================

	return (
		<>
			{/* Main Navigation Bar */}
			<nav className="navbar">
				{/* Logo/Brand - Always visible, links to games page */}
				<Link className="logo" to="/games">
					LuckyBet
				</Link>

				{/* Center Section - Leaderboard button (authenticated users only) */}
				{user && !isAuthPage && (
					<div className="navbar-center">
						<button
							className="leaderboard-btn"
							onClick={toggleLeaderboard}
							aria-label="Open leaderboard"
							title="View player rankings"
						>
							🏆 Leaderboard
						</button>
					</div>
				)}

				{/* Right Section - User actions or auth links */}
				<div className="nav-links">
					{
						user && !isAuthPage ? (
							/* Authenticated user on app pages - Show profile */
							<div className="profile-container">
								<div
									className="profile-icon"
									onClick={goToProfile}
									title="Go to Profile"
									role="button"
									tabIndex={0}
									onKeyDown={(e) => {
										// Support keyboard navigation
										if (
											e.key === "Enter" ||
											e.key === " "
										) {
											e.preventDefault();
											goToProfile();
										}
									}}
									aria-label={`Go to profile (${
										user.name || user.email
									})`}
								>
									{getUserInitial()}
								</div>
							</div>
						) : !user ? (
							/* Unauthenticated user - Show auth links */
							<>
								<Link to="/login">Login</Link>
								<Link to="/register">Register</Link>
							</>
						) : null /* Authenticated user on auth pages - Show nothing */
					}
				</div>
			</nav>

			{/* Leaderboard Modal Overlay */}
			{showLeaderboard && (
				<div
					className="modal-backdrop"
					onClick={handleBackdropClick}
					role="dialog"
					aria-modal="true"
					aria-labelledby="leaderboard-title"
				>
					<div
						className="leaderboard-modal"
						onClick={handleModalContentClick}
					>
						{/* Modal Header */}
						<div className="modal-header">
							<h2 id="leaderboard-title">🏆 Leaderboard</h2>
							<button
								className="close-btn"
								onClick={toggleLeaderboard}
								aria-label="Close leaderboard"
								title="Close"
							>
								×
							</button>
						</div>

						{/* Modal Content - Leaderboard Component */}
						<Leaderboard />
					</div>
				</div>
			)}
		</>
	);
}
