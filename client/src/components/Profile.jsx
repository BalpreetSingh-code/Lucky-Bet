/**
 * User Profile Management Component
 *
 * A comprehensive user profile interface for the LuckyBet casino application
 * that provides account management functionality including profile viewing,
 * balance management, password updates, daily bonus claiming, and logout.
 *
 * Features:
 * - Read-only profile information display (username, email)
 * - Real-time balance display with manual balance update capability
 * - Daily bonus system with claim functionality (+1000 coins)
 * - Secure password change with validation and confirmation
 * - Session management with logout functionality
 * - User-friendly messaging system for feedback
 * - Form validation and error handling
 * - Authentication guard (redirects to login if not authenticated)
 * - Responsive design with organized sections
 *
 * Security Features:
 * - Current password verification for password changes
 * - Password strength requirements (minimum 6 characters)
 * - Password confirmation matching validation
 * - Authenticated API requests with session cookies
 * - Protected route with login redirect
 *
 * User Experience:
 * - Auto-dismissing success/error messages
 * - Loading states for all async operations
 * - Intuitive form toggles and cancellation
 * - Clear visual feedback for all actions
 * - Navigation back to games
 *
 * @component
 * @author LuckyBet Inc.
 * @version 1.0.0
 */

import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "../styles/Profile.css";

/**
 * Main Profile Management Component
 *
 * Provides a comprehensive interface for users to manage their account
 * settings, view profile information, update balance, change passwords,
 * claim daily bonuses, and logout from the application.
 *
 * @returns {JSX.Element} The complete profile management interface
 */
export default function Profile() {
	// ===================
	// CONTEXT & HOOKS
	// ===================

	/**
	 * User context providing authenticated user data and update functions
	 * Contains user profile, balance update function, and user setter
	 */
	const { user, updateBalance, setUser } = useContext(UserContext);

	/**
	 * React Router navigation hook for programmatic routing
	 * Used for redirecting unauthenticated users and navigation
	 */
	const navigate = useNavigate();

	// ===================
	// STATE DECLARATIONS
	// ===================

	/**
	 * @type {Object} Form data for profile information display and balance updates
	 * @property {string} username - User's display name
	 * @property {string} email - User's email address
	 * @property {number} balance - User's account balance
	 */
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		balance: 0,
	});

	/**
	 * @type {Object} Password change form data
	 * @property {string} currentPassword - User's current password for verification
	 * @property {string} newPassword - New password to set
	 * @property {string} confirmPassword - Confirmation of new password
	 */
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	/**
	 * @type {boolean} Controls visibility of password change form
	 */
	const [showPasswordForm, setShowPasswordForm] = useState(false);

	/**
	 * @type {boolean} Loading state for async operations (API calls)
	 */
	const [loading, setLoading] = useState(false);

	/**
	 * @type {string} User feedback message content
	 */
	const [message, setMessage] = useState("");

	/**
	 * @type {string} Message type for styling ("success" or "error")
	 */
	const [messageType, setMessageType] = useState("");

	// Daily bonus system state
	/**
	 * @type {boolean} Whether daily bonus has been claimed today
	 */
	const [bonusClaimed, setBonusClaimed] = useState(false);

	/**
	 * @type {string} Daily bonus feedback message
	 */
	const [bonusMessage, setBonusMessage] = useState("");

	// ===================
	// LIFECYCLE EFFECTS
	// ===================

	/**
	 * Authentication guard and form initialization
	 *
	 * Process:
	 * 1. Checks if user is authenticated
	 * 2. Redirects to login if not authenticated
	 * 3. Initializes form data with user information
	 *
	 * Dependencies: [user, navigate]
	 * Runs on component mount and when user/navigate changes
	 */
	useEffect(() => {
		if (!user) {
			navigate("/login");
			return;
		}

		// Initialize form with user data
		setFormData({
			username: user.username || "",
			email: user.email || "",
			balance: user.balance || 0,
		});
	}, [user, navigate]);

	// ===================
	// UTILITY FUNCTIONS
	// ===================

	/**
	 * Displays a temporary message to the user with auto-dismiss
	 *
	 * Features:
	 * - Sets message content and type (success/error)
	 * - Auto-dismisses after 3 seconds
	 * - Clears both message and type on dismissal
	 *
	 * @param {string} msg - Message content to display
	 * @param {string} type - Message type ("success" or "error") for styling
	 * @returns {void}
	 *
	 * @example
	 * showMessage("Balance updated successfully!", "success");
	 * showMessage("Invalid password", "error");
	 */
	const showMessage = (msg, type) => {
		setMessage(msg);
		setMessageType(type);

		// Auto-dismiss after 3 seconds
		setTimeout(() => {
			setMessage("");
			setMessageType("");
		}, 3000);
	};

	// ===================
	// FORM HANDLERS
	// ===================

	/**
	 * Handles input changes for profile form fields
	 * Updates formData state with new values from form inputs
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
	 * @returns {void}
	 */
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	/**
	 * Handles input changes for password form fields
	 * Updates passwordData state with new values from password inputs
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
	 * @returns {void}
	 */
	const handlePasswordChange = (e) => {
		const { name, value } = e.target;
		setPasswordData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// ===================
	// API FUNCTIONS
	// ===================

	/**
	 * Updates user's account balance via API
	 *
	 * Process:
	 * 1. Validates balance input (numeric, non-negative)
	 * 2. Sends PUT request to update balance endpoint
	 * 3. Updates global user context with new balance
	 * 4. Displays success/error feedback to user
	 *
	 * Validation:
	 * - Must be a valid number
	 * - Must be non-negative (>= 0)
	 * - Decimal precision supported
	 *
	 * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
	 * @returns {Promise<void>}
	 *
	 * @example
	 * // User enters "1500.50" in balance field and submits
	 * // Function validates, sends to API, updates context
	 */
	const updateBalanceHandler = async (e) => {
		e.preventDefault();
		const balance = Number(formData.balance);

		// Validate balance input
		if (isNaN(balance) || balance < 0) {
			showMessage("Invalid balance amount", "error");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("http://localhost:3000/user/balance", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // Include session cookies
				body: JSON.stringify({ balance }),
			});

			const data = await response.json();

			if (response.ok) {
				// Update global user context
				updateBalance(data.payload.balance);
				showMessage("Balance updated successfully!", "success");
			} else {
				showMessage(
					data.message || "Failed to update balance",
					"error"
				);
			}
		} catch (error) {
			console.error("Balance update error:", error);
			showMessage("Error connecting to server", "error");
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Updates user's password with security validation
	 *
	 * Process:
	 * 1. Validates password confirmation matches
	 * 2. Validates password strength (minimum 6 characters)
	 * 3. Sends PUT request with current and new password
	 * 4. Clears form and hides password form on success
	 * 5. Displays appropriate feedback messages
	 *
	 * Security Features:
	 * - Requires current password for verification
	 * - Minimum length validation (6 characters)
	 * - Password confirmation matching
	 * - Server-side validation and verification
	 *
	 * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
	 * @returns {Promise<void>}
	 *
	 * @example
	 * // User enters current password, new password, and confirmation
	 * // Function validates locally, then sends to server for verification
	 */
	const updatePassword = async (e) => {
		e.preventDefault();

		// Validate password confirmation
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			showMessage("New passwords don't match", "error");
			return;
		}

		// Validate password strength
		if (passwordData.newPassword.length < 6) {
			showMessage("Password must be at least 6 characters", "error");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(
				"http://localhost:3000/user/password",
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include", // Include session cookies
					body: JSON.stringify({
						currentPassword: passwordData.currentPassword,
						newPassword: passwordData.newPassword,
					}),
				}
			);

			const data = await response.json();

			if (response.ok) {
				// Clear form and hide password form on success
				setPasswordData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
				setShowPasswordForm(false);
				showMessage("Password updated successfully!", "success");
			} else {
				showMessage(
					data.message || "Failed to update password",
					"error"
				);
			}
		} catch (error) {
			console.error("Password update error:", error);
			showMessage("Error connecting to server", "error");
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Logs out the user and redirects to home page
	 *
	 * Process:
	 * 1. Sends POST request to logout endpoint
	 * 2. Clears user context (sets to null)
	 * 3. Redirects to home page using window.location
	 * 4. Handles any logout errors gracefully
	 *
	 * Security:
	 * - Server-side session invalidation
	 * - Complete context clearing
	 * - Force navigation to public page
	 *
	 * @returns {Promise<void>}
	 */
	const logout = async () => {
		try {
			const response = await fetch("http://localhost:3000/auth/logout", {
				method: "POST",
				credentials: "include", // Include session cookies for invalidation
			});

			if (response.ok) {
				// Clear user context and redirect
				setUser(null);
				window.location.href = "/"; // Force page reload to clear all state
			}
		} catch (error) {
			console.error("Logout error:", error);
			// Even if logout fails, clear local state
			setUser(null);
			window.location.href = "/";
		}
	};

	/**
	 * Claims daily bonus for the user
	 *
	 * Daily Bonus System:
	 * - Awards +1000 coins once per day
	 * - Tracks claim status to prevent multiple claims
	 * - Updates user balance in global context
	 * - Provides feedback on claim status
	 *
	 * Error Handling:
	 * - 403 status: Bonus already claimed (disables button)
	 * - Network errors: Connection error message
	 * - Other errors: Generic error handling
	 *
	 * @returns {Promise<void>}
	 *
	 * @example
	 * claimBonus(); // Awards 1000 coins and updates balance
	 */
	const claimBonus = async () => {
		try {
			const res = await fetch("http://localhost:5173/bonus", {
				method: "POST",
				credentials: "include",
			});

			const data = await res.json();

			if (res.ok) {
				// Successful bonus claim
				setBonusClaimed(true);
				setUser((prev) => ({
					...prev,
					balance: data.payload.newBalance,
				}));
				setBonusMessage("Daily bonus claimed! +1000 coins");
			} else {
				// Handle various error scenarios
				setBonusMessage(data.message || "Bonus already claimed");
				if (res.status === 403) {
					setBonusClaimed(true); // Disable button if already claimed
				}
			}
		} catch (error) {
			console.error("Bonus claim error:", error);
			setBonusMessage("Error connecting to server");
		}
	};

	// Early return for loading state
	if (!user) {
		return <div>Loading...</div>;
	}

	// ===================
	// RENDER COMPONENT
	// ===================

	return (
		<div className="profile-page">
			<div className="profile-container">
				{/* Profile Header */}
				<div className="profile-header">
					<div className="profile-avatar">
						{user.name
							? user.name.charAt(0).toUpperCase()
							: user.email.charAt(0).toUpperCase()}
					</div>
					<h1>My Profile</h1>
					<button
						className="back-btn"
						onClick={() => navigate("/games")}
					>
						← Back to Games
					</button>
				</div>

				{/* Global Message Display */}
				{message && (
					<div className={`message ${messageType}`}>{message}</div>
				)}

				<div className="profile-content">
					{/* Profile Information Section */}
					<div className="profile-section">
						<h2>Profile Information</h2>
						<form>
							<div className="form-group">
								<label htmlFor="username">Username</label>
								<input
									type="text"
									id="username"
									name="username"
									value={formData.username}
									readOnly
								/>
							</div>

							<div className="form-group">
								<label htmlFor="email">Email</label>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									readOnly
								/>
							</div>
						</form>
					</div>

					{/* Account Balance Section */}
					<div className="profile-section">
						<h2>Account Balance</h2>
						<div className="balance-display-large">
							${user?.balance?.toFixed(2) ?? "0.00"}
						</div>

						{/* Daily Bonus Feature */}
						<button
							className="btn btn-primary"
							onClick={claimBonus}
							disabled={bonusClaimed}
							style={{ marginTop: "1rem" }}
						>
							{bonusClaimed
								? "Bonus already claimed"
								: "Claim Daily Bonus (+1000 coins)"}
						</button>
						{bonusMessage && (
							<p className="bonus-message">{bonusMessage}</p>
						)}

						{/* Manual Balance Update Form */}
						<form onSubmit={updateBalanceHandler}>
							<div className="form-group">
								<label htmlFor="balance">Set New Balance</label>
								<input
									type="number"
									id="balance"
									name="balance"
									value={formData.balance}
									onChange={handleInputChange}
									min="0"
									step="0.01"
									placeholder="Enter new balance"
								/>
							</div>
							<button
								type="submit"
								className="btn btn-secondary"
								disabled={loading}
							>
								{loading ? "Updating..." : "Update Balance"}
							</button>
						</form>
					</div>

					{/* Password Management Section */}
					<div className="profile-section">
						<h2>Password</h2>
						{!showPasswordForm ? (
							/* Password Hidden State */
							<div>
								<p>••••••••</p>
								<button
									className="btn btn-outline"
									onClick={() => setShowPasswordForm(true)}
								>
									Change Password
								</button>
							</div>
						) : (
							/* Password Change Form */
							<form onSubmit={updatePassword}>
								<div className="form-group">
									<label htmlFor="currentPassword">
										Current Password
									</label>
									<input
										type="password"
										id="currentPassword"
										name="currentPassword"
										value={passwordData.currentPassword}
										onChange={handlePasswordChange}
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="newPassword">
										New Password
									</label>
									<input
										type="password"
										id="newPassword"
										name="newPassword"
										value={passwordData.newPassword}
										onChange={handlePasswordChange}
										minLength="6"
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="confirmPassword">
										Confirm New Password
									</label>
									<input
										type="password"
										id="confirmPassword"
										name="confirmPassword"
										value={passwordData.confirmPassword}
										onChange={handlePasswordChange}
										minLength="6"
										required
									/>
								</div>

								{/* Form Action Buttons */}
								<div className="form-actions">
									<button
										type="submit"
										className="btn btn-primary"
										disabled={loading}
									>
										{loading
											? "Updating..."
											: "Update Password"}
									</button>
									<button
										type="button"
										className="btn btn-outline"
										onClick={() => {
											setShowPasswordForm(false);
											setPasswordData({
												currentPassword: "",
												newPassword: "",
												confirmPassword: "",
											});
										}}
									>
										Cancel
									</button>
								</div>
							</form>
						)}
					</div>

					{/* Account Actions Section */}
					<div className="profile-section">
						<h2>Account Actions</h2>
						<button className="btn btn-danger" onClick={logout}>
							Logout
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
