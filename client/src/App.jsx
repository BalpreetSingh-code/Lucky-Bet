/**
 * Main Application Component
 *
 * The root component for the LuckyBet casino application that defines the
 * overall application structure, routing configuration, and layout. Provides
 * a consistent navigation experience with persistent header and footer while
 * managing all application routes and navigation flows.
 *
 * Features:
 * - React Router-based navigation with declarative routing
 * - Persistent navigation bar across all pages
 * - Consistent footer across all pages
 * - Automatic redirect from root to login page
 * - Organized route structure with logical grouping
 * - Fallback route for unmatched URLs
 * - Game-specific routes with clean URL structure
 * - User profile and authentication routes
 *
 * Application Structure:
 * - Header: NavBar component (authentication-aware)
 * - Main Content: Route-based component rendering
 * - Footer: Footer component (always visible)
 *
 * Route Categories:
 * - Authentication: /login, /register
 * - Core Application: /games (game selection hub)
 * - Game Routes: /play/* (individual game experiences)
 * - User Management: /profile (account settings)
 * - Navigation: / (redirects to login), /* (fallback to home)
 *
 * Navigation Flow:
 * 1. Unauthenticated users start at /login
 * 2. New users can register at /register
 * 3. Authenticated users access games via /games
 * 4. Individual games accessible at /play/[gamename]
 * 5. Profile management available at /profile
 *
 * @component
 * @author LuckyBet Inc.
 * @version 1.0.0
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout Components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

// Page Components
import Home from "./components/Home";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import GameSelectionPage from "./components/GameSelectionPage";
import Profile from "./components/Profile";

// Game Components
import CoinFlipPage from "./components/CoinFlipPage";
import BlackJackPage from "./components/BlackJackPage";
import RoulettePage from "./components/RoulettePage";

// Global Styles
import "./styles/App.css";

/**
 * Main Application Component
 *
 * Defines the core application structure with persistent navigation,
 * routing configuration, and layout management. All components are
 * rendered within this root component structure.
 *
 * Layout Structure:
 * - NavBar: Persistent header with authentication-aware navigation
 * - Routes: Dynamic content area based on current route
 * - Footer: Persistent footer with branding and legal links
 *
 * Route Organization:
 * Routes are organized logically with clear URL patterns and
 * appropriate component mappings for user navigation.
 *
 * @returns {JSX.Element} The complete application layout with routing
 */
export default function App() {
	return (
		<>
			{/*
			 * Persistent Navigation Header
			 *
			 * Displays across all pages with context-aware content:
			 * - Unauthenticated: Login/Register links
			 * - Authenticated: Profile icon, leaderboard access
			 * - Auth pages: Minimal branding only
			 */}
			<NavBar />

			{/*
			 * Main Application Routes
			 *
			 * Defines all application navigation paths and their
			 * corresponding components. Routes are processed in order
			 * with first match taking precedence.
			 */}
			<Routes>
				{/*
				 * Root Route - Authentication Entry Point
				 *
				 * Automatically redirects users from "/" to "/login"
				 * to ensure they start with authentication flow.
				 *
				 * Uses 'replace' to avoid back button confusion.
				 */}
				<Route path="/" element={<Navigate to="/login" replace />} />

				{/*
				 * Authentication Routes
				 *
				 * Handles user authentication and account creation.
				 * These routes are accessible to unauthenticated users
				 * and redirect to games upon successful authentication.
				 */}
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				{/*
				 * Core Application Route
				 *
				 * Main hub for authenticated users to select games.
				 * Acts as the primary landing page after login and
				 * provides navigation to all available games.
				 */}
				<Route path="/games" element={<GameSelectionPage />} />

				{/*
				 * Game Routes
				 *
				 * Individual game experiences with clean URL structure.
				 * All game routes follow the pattern "/play/[gamename]"
				 * for consistency and easy identification.
				 */}
				<Route path="/play/blackjack" element={<BlackJackPage />} />
				<Route path="/play/coinflip" element={<CoinFlipPage />} />
				<Route path="/play/roulette" element={<RoulettePage />} />

				{/*
				 * User Management Route
				 *
				 * Provides authenticated users access to profile
				 * management, balance updates, password changes,
				 * and account settings.
				 */}
				<Route path="/profile" element={<Profile />} />

				{/*
				 * Fallback Route - Catch All
				 *
				 * Handles any unmatched URLs by rendering the Home
				 * component. Placed last to ensure it only catches
				 * routes that don't match any specific patterns.
				 *
				 * Note: "*" matches any remaining path segments.
				 */}
				<Route path="*" element={<Home />} />
			</Routes>

			{/*
			 * Persistent Footer
			 *
			 * Displays across all pages with consistent branding,
			 * legal information, and additional navigation links.
			 * Provides closure to the page layout.
			 */}
			<Footer />
		</>
	);
}
