/**
 * Login Page Component
 *
 * Handles user authentication for the LuckyBet casino application.
 * Provides a secure login form with email/password validation, session
 * management, and seamless navigation to the main application upon success.
 *
 * Features:
 * - Email and password authentication
 * - Session-based authentication with cookies
 * - Automatic user profile fetching after login
 * - Form validation with required fields
 * - Error handling with user feedback
 * - Navigation to registration for new users
 * - Responsive design with card-based layout
 *
 * Authentication Flow:
 * 1. User submits email and password
 * 2. POST request to /login endpoint
 * 3. Server validates credentials and creates session
 * 4. Fetch user profile data from /profile endpoint
 * 5. Update application state with user data
 * 6. Navigate to games selection page
 *
 * Security Features:
 * - Credentials included for session cookies
 * - Password field with proper input type
 * - Server-side validation and error responses
 * - Content-Type validation for responses
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
 * Main Login Component
 *
 * Manages the complete user authentication process including form handling,
 * API communication, state management, and navigation flow. Integrates with
 * the UserContext for global state management.
 *
 * @returns {JSX.Element} The complete login page interface
 */
export default function LoginPage() {
	// ===================
	// STATE DECLARATIONS
	// ===================

	/**
	 * @type {string} User's email address input value
	 */
	const [email, setEmail] = useState("");

	/**
	 * @type {string} User's password input value
	 */
	const [password, setPassword] = useState("");

	// ===================
	// HOOKS & CONTEXT
	// ===================

	/**
	 * React Router navigation hook for programmatic routing
	 * Used to redirect to games page after successful login
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
	 * Handles login form submission and authentication process
	 *
	 * Authentication Process:
	 * 1. Prevents default form submission behavior
	 * 2. Sends login credentials to server
	 * 3. Handles server response and validates success
	 * 4. Fetches user profile data upon successful login
	 * 5. Updates global user state with profile data
	 * 6. Navigates to games selection page
	 * 7. Handles errors with user-friendly messages
	 *
	 * API Endpoints:
	 * - POST /login: Authenticates user and creates session
	 * - GET /profile: Fetches authenticated user's profile data
	 *
	 * Error Handling:
	 * - HTTP errors: Server-side validation failures
	 * - Network errors: Connection issues
	 * - Response validation: Ensures valid JSON responses
	 * - User feedback: Alert messages for all error scenarios
	 *
	 * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
	 * @returns {void}
	 *
	 * @example
	 * // User submits form with email "user@example.com" and password "pass123"
	 * // Function validates credentials, creates session, and redirects to games
	 */
	const handleSubmit = (e) => {
		e.preventDefault(); // Prevent default form submission

		// Step 1: Send login credentials to server
		fetch("/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include", // Include session cookies
			body: JSON.stringify({ email, password }),
		})
			.then((res) => {
				// Handle HTTP errors from login endpoint
				if (!res.ok) {
					return res.json().then((err) => Promise.reject(err));
				}
				return res.json();
			})
			.then(async () => {
				// Step 2: Fetch user profile data after successful login
				const res = await fetch("http://localhost:3000/profile", {
					credentials: "include", // Include session cookies for authentication
				});

				// Validate response content type
				const contentType = res.headers.get("Content-Type") || "";

				if (res.ok && contentType.includes("application/json")) {
					// Step 3: Parse profile data and update global state
					const data = await res.json();
					setUser(data.payload); // Update UserContext with user data

					// Step 4: Navigate to games selection page
					navigate("/games");
				} else {
					// Handle invalid response format
					const text = await res.text();
					console.error("Invalid profile response:", text);
					alert("Login succeeded but server returned invalid data.");
				}
			})
			.catch((err) => {
				// Step 5: Handle all errors with user feedback
				console.error("Login error:", err);
				alert(err.message || "Login failed.");
			});
	};

	// ===================
	// INPUT HANDLERS
	// ===================

	/**
	 * Updates email state when user types in email input field
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
	 * @returns {void}
	 */
	const handleEmailChange = (e) => {
		setEmail(e.target.value);
	};

	/**
	 * Updates password state when user types in password input field
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
	 * @returns {void}
	 */
	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
	};

	// ===================
	// RENDER COMPONENT
	// ===================

	return (
		<div className="container">
			<div className="card">
				{/* Login header */}
				<h2>Login</h2>
				<p>to get started</p>

				{/* Login form */}
				<form onSubmit={handleSubmit}>
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
						autoComplete="current-password"
						aria-label="Password"
					/>

					{/* Submit button */}
					<button type="submit">Continue</button>
				</form>

				{/* Navigation links */}
				<div className="footer-links">
					<Link to="/register" className="spaced-link">
						New User? Register
					</Link>
				</div>
			</div>
		</div>
	);
}
