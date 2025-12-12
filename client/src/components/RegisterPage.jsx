/**
 * User Registration Page Component
 *
 * Handles new user account creation for the LuckyBet casino application.
 * Provides a comprehensive registration form with validation, terms agreement,
 * and seamless onboarding flow that automatically logs in users after successful
 * registration.
 *
 * Features:
 * - Multi-field registration form (username, email, password, confirmation)
 * - Client-side form validation with immediate feedback
 * - Password strength requirements (minimum 8 characters)
 * - Password confirmation matching validation
 * - Terms and conditions agreement requirement
 * - Automatic login and profile fetching after registration
 * - Session-based authentication with cookies
 * - Navigation to games page upon successful registration
 * - Error handling with user-friendly messages
 * - Responsive design with card-based layout
 *
 * Registration Flow:
 * 1. User completes registration form with validation
 * 2. Form data submitted to /register endpoint
 * 3. Server creates account and establishes session
 * 4. Automatic profile data fetch from /profile endpoint
 * 5. User context updated with profile information
 * 6. Navigation to games selection page
 *
 * Validation Rules:
 * - Username: Required, any length
 * - Email: Required, valid email format
 * - Password: Required, minimum 8 characters
 * - Password Confirmation: Must match password exactly
 * - Terms Agreement: Required checkbox acceptance
 *
 * Security Features:
 * - Password strength enforcement
 * - Server-side validation and sanitization
 * - Session-based authentication
 * - Secure password transmission
 *
 * @component
 * @author LuckyBet Inc.
 * @version 1.0.0
 */

import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "../styles/App.css";

/**
 * Main Registration Component
 *
 * Manages the complete user registration process including form handling,
 * validation, API communication, and post-registration authentication flow.
 * Integrates with UserContext for global state management.
 *
 * @returns {JSX.Element} The complete registration page interface
 */
export default function RegisterPage() {
	// ===================
	// STATE DECLARATIONS
	// ===================

	/**
	 * @type {string} User's chosen username for account identification
	 */
	const [username, setUsername] = useState("");

	/**
	 * @type {string} User's email address for account and communication
	 */
	const [email, setEmail] = useState("");

	/**
	 * @type {string} User's chosen password (minimum 8 characters required)
	 */
	const [password, setPassword] = useState("");

	/**
	 * @type {string} Password confirmation field for validation
	 */
	const [confirm, setConfirm] = useState("");

	/**
	 * @type {boolean} Terms and conditions agreement status
	 */
	const [agreed, setAgreed] = useState(false);

	// ===================
	// HOOKS & CONTEXT
	// ===================

	/**
	 * React Router navigation hook for programmatic routing
	 * Used to redirect to games page after successful registration
	 */
	const navigate = useNavigate();

	/**
	 * User context for global state management
	 * Provides setUser function to update authenticated user data
	 */
	const { setUser } = useContext(UserContext);

	// ===================
	// EVENT HANDLERS
	// ===================

	/**
	 * Handles registration form submission with comprehensive validation
	 *
	 * Validation Process:
	 * 1. Password length validation (minimum 8 characters)
	 * 2. Password confirmation matching validation
	 * 3. Terms and conditions agreement validation
	 * 4. Server-side registration with error handling
	 * 5. Automatic profile fetching upon successful registration
	 * 6. User context update and navigation to games
	 *
	 * Registration API Flow:
	 * 1. POST /register with user credentials
	 * 2. Server validates and creates account
	 * 3. Session established with authentication cookies
	 * 4. GET /profile to fetch new user's profile data
	 * 5. Profile data stored in global context
	 * 6. Navigation to games selection page
	 *
	 * Error Handling:
	 * - Client-side validation errors: Alert with specific message
	 * - Server-side errors: Registration conflicts, validation failures
	 * - Network errors: Connection issues during registration
	 * - Profile fetch errors: Issues loading user data after registration
	 *
	 * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
	 * @returns {void}
	 *
	 * @example
	 * // User fills form: username="john_doe", email="john@example.com",
	 * // password="securepass123", confirm="securepass123", agreed=true
	 * // Function validates, registers, fetches profile, and redirects
	 */
	const handleSubmit = (e) => {
		e.preventDefault(); // Prevent default form submission

		// Client-side validation
		if (password.length < 8) {
			return alert("Password must be at least 8 characters");
		}
		if (password !== confirm) {
			return alert("Passwords do not match");
		}
		if (!agreed) {
			return alert("You must agree to terms");
		}

		// Step 1: Submit registration data
		fetch("/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include", // Include cookies for session management
			body: JSON.stringify({ username, email, password }),
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				}
				// Handle registration errors
				return res.json().then((err) => {
					throw new Error(err.message);
				});
			})
			.then(() => {
				// Step 2: Fetch user profile after successful registration
				return fetch("http://localhost:3000/profile", {
					method: "GET",
					credentials: "include", // Use session cookies for authentication
				});
			})
			.then((res) => res.json())
			.then((data) => {
				// Step 3: Update global user context and navigate
				setUser(data.payload);
				navigate("/games");
			})
			.catch((err) => {
				// Handle all errors with user feedback
				console.error("Registration error:", err);
				alert(err.message);
			});
	};

	// ===================
	// INPUT HANDLERS
	// ===================

	/**
	 * Updates username state when user types in username field
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
	 * @returns {void}
	 */
	const handleUsernameChange = (e) => {
		setUsername(e.target.value);
	};

	/**
	 * Updates email state when user types in email field
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
	 * @returns {void}
	 */
	const handleEmailChange = (e) => {
		setEmail(e.target.value);
	};

	/**
	 * Updates password state when user types in password field
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
	 * @returns {void}
	 */
	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
	};

	/**
	 * Updates password confirmation state when user types in confirm field
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
	 * @returns {void}
	 */
	const handleConfirmChange = (e) => {
		setConfirm(e.target.value);
	};

	/**
	 * Updates terms agreement state when user toggles checkbox
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - Checkbox change event
	 * @returns {void}
	 */
	const handleAgreedChange = (e) => {
		setAgreed(e.target.checked);
	};

	// ===================
	// RENDER COMPONENT
	// ===================

	return (
		<div className="container">
			<div className="card">
				{/* Registration header */}
				<h2>Register</h2>
				<p>to get started</p>

				{/* Registration form */}
				<form onSubmit={handleSubmit}>
					{/* Username input field */}
					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={handleUsernameChange}
						required
						autoComplete="username"
						aria-label="Username"
						minLength="1"
					/>

					{/* Email input field */}
					<input
						type="email"
						placeholder="youremail@gmail.com"
						value={email}
						onChange={handleEmailChange}
						required
						autoComplete="email"
						aria-label="Email address"
					/>

					{/* Password input field */}
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={handlePasswordChange}
						required
						autoComplete="new-password"
						aria-label="Password"
						minLength="8"
					/>

					{/* Password confirmation field */}
					<input
						type="password"
						placeholder="Confirm Password"
						value={confirm}
						onChange={handleConfirmChange}
						required
						autoComplete="new-password"
						aria-label="Confirm password"
						minLength="8"
					/>

					{/* Terms and conditions agreement */}
					<label className="checkbox">
						<input
							type="checkbox"
							checked={agreed}
							onChange={handleAgreedChange}
							required
							aria-label="Agree to terms and conditions"
						/>
						Agree to Our Terms and Conditions
					</label>

					{/* Submit button */}
					<button type="submit">Continue</button>
				</form>

				{/* Navigation links */}
				<div className="footer-links">
					<Link to="/login">Already registered? Login</Link>
				</div>
			</div>
		</div>
	);
}
