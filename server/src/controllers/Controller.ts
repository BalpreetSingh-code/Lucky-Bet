import postgres from "postgres";
import Router from "../router/Router";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import UserModel from "../models/UserModel";
import AuthService from "../auth/AuthService";
import GameService from "../Services/GameService";

/**
 * Controller class handles the business logic for each route in the application.
 * This includes user registration, login, game logic (roulette, coin flip),
 * profile management, and session handling.
 */
export default class Controller {
	private sql: postgres.Sql;
	private userModel: UserModel;
	private authService: AuthService;
	private gameService: GameService;

	/**
	 * Initializes the Controller with a PostgreSQL client.
	 * @param sql - The postgres SQL instance.
	 */
	constructor(sql: postgres.Sql) {
		this.sql = sql;
		this.userModel = new UserModel(sql);
		this.authService = new AuthService(this.userModel);
		this.gameService = new GameService(this.userModel);
	}

	/**
	 * Registers all routes and binds corresponding handler methods.
	 * @param router - Instance of Router to register paths on.
	 */
	registerRoutes(router: Router) {
		router.post("/register", this.register);
		router.post("/login", this.login);
		router.get("/games", this.getGames);
		router.get("/profile", this.profile);

		router.post("/play/roulette", this.playRoulette);
		router.post("/play/blackjack", this.playBlackjack);
		router.post("/play/coinflip", this.playCoinFlip);

		router.post("/user/balance", this.setBalance);
		router.post("/api/users/updateBalance", this.updateBalance);

		router.get("/leaderboard", this.getLeaderboard);
		router.put("/user/profile", this.updateProfile);
		router.put("/user/password", this.updatePassword);
		router.post("/auth/logout", this.logout);
	}

	/**
	 * Handles user registration and session creation.
	 */
	private register = async (req: Request, res: Response) => {
		const { username, email, password } = req.body;

		if (!username || !email || !password) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: "Username, email, and password required",
			});
		}

		try {
			const newUser = await this.authService.register(
				username,
				email,
				password,
			);

			// Save session
			req.session.set("user", { id: newUser.id });
			res.setCookie(req.session.cookie);

			return res.send({
				statusCode: StatusCode.Created,
				message: "Registered",
				payload: {
					id: newUser.id,
					username: newUser.username,
					email: newUser.email,
					balance: newUser.balance,
				},
			});
		} catch (err: any) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: err.message || "Registration failed",
			});
		}
	};

	/**
	 * Authenticate user by email & password, return balance.
	 */
	private login = async (req: Request, res: Response) => {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: "Email and password required",
			});
		}

		try {
			const user = await this.authService.login(email, password);

			req.session.set("user", { id: user.id });
			res.setCookie(req.session.cookie);

			return res.send({
				statusCode: StatusCode.OK,
				message: "Logged in",
				payload: {
					id: user.id,
					username: user.username,
					email: user.email,
					balance: user.balance,
				},
			});
		} catch (err: any) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: err.message || "Login failed",
			});
		}
	};

	/**
	 * Return list of available games.
	 */
	private getGames = async (_req: Request, res: Response) => {
		const games = ["roulette", "blackjack", "coinflip"];
		return res.send({
			statusCode: StatusCode.OK,
			message: "Available games",
			payload: { games },
		});
	};

	/**
	 * Stub: roulette logic (no db update).
	 */
	/**
	 * Play Roulette: deduct bet, credit payout, update user balance.
	 */
	private playRoulette = async (req: Request, res: Response) => {
		const { betType, amount } = req.body;
		const user = req.session.get("user");

		if (!user?.id) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Not logged in",
			});
		}

		try {
			const result = await this.gameService.playRoulette(
				user.id,
				betType,
				amount,
			);
			return res.send({
				statusCode: StatusCode.OK,
				message: "Roulette result",
				payload: result,
			});
		} catch (err: any) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: err.message || "Spin failed",
			});
		}
	};

	/**
	 * Stub: blackjack logic (no db update yet).
	 */
	private playBlackjack = async (_req: Request, res: Response) => {
		return res.send({
			statusCode: StatusCode.OK,
			message: "Blackjack result",
			payload: { win: false, payout: 0 },
		});
	};

	/**
	 * Stub: coin flip logic (no db update).
	 */
	/**
	 * Play Coin Flip: deduct bet, credit payout, update user balance.
	 */
	private playCoinFlip = async (req: Request, res: Response) => {
		const { guess, amount } = req.body;
		const user = req.session.get("user");

		if (!user?.id) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Not logged in",
			});
		}

		try {
			const result = await this.gameService.playCoinFlip(
				user.id,
				guess.toLowerCase(),
				amount,
			);
			return res.send({
				statusCode: StatusCode.OK,
				message: "Coin flip result",
				payload: result,
			});
		} catch (err: any) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: err.message || "Flip failed",
			});
		}
	};

	/**
	 * Returns user profile details from session.
	 */
	private profile = async (req: Request, res: Response) => {
		const sessionUser = req.session.get("user");
		if (!sessionUser?.id) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Not logged in",
			});
		}

		try {
			const user = await this.authService.getProfile(sessionUser.id);
			if (!user) {
				return res.send({
					statusCode: StatusCode.NotFound,
					message: "User not found",
				});
			}

			return res.send({
				statusCode: StatusCode.OK,
				message: "Profile fetched",
				payload: user,
			});
		} catch (err: any) {
			return res.send({
				statusCode: StatusCode.InternalServerError,
				message: err.message || "Failed to fetch profile",
			});
		}
	};

	/**
	 * Sets a new balance value for the authenticated user.
	 */
	// POST /user/balance
	private setBalance = async (req: Request, res: Response) => {
		const userSession = req.session.get("user");
		const { balance } = req.body;
		if (!userSession?.id) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Not logged in",
			});
		}
		if (typeof balance !== "number" || balance < 0) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: "Invalid balance",
			});
		}

		await this.sql`
    UPDATE users
    SET balance = ${balance}
    WHERE id = ${userSession.id}
  `;

		return res.send({
			statusCode: StatusCode.OK,
			message: "Balance updated",
			payload: { balance },
		});
	};

	/**
	 * Updates user balance in the database.
	 */
	private updateBalance = async (req: Request, res: Response) => {
		const sessionUser = req.session.get("user");
		if (!sessionUser) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Not logged in",
			});
		}

		const { newBalance } = req.body;

		try {
			await this.authService.updateBalance(sessionUser.id, newBalance);
			return res.send({
				statusCode: StatusCode.OK,
				message: "Balance updated",
			});
		} catch (err: any) {
			console.error("Update balance failed:", err);
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: err.message || "Balance update failed",
			});
		}
	};

	/**
	 * Retrieves the top 10 users sorted by balance.
	 */
	getLeaderboard = async (req: Request, res: Response) => {
		try {
			const leaderboard = await this.sql`
				SELECT id, username, email, balance 
				FROM users 
				ORDER BY balance DESC 
				LIMIT 10
			`;

			res.send({
				statusCode: StatusCode.OK,
				message: "Leaderboard retrieved successfully",
				payload: leaderboard,
			});
		} catch (error) {
			console.error("Error fetching leaderboard:", error);
			res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Failed to fetch leaderboard",
			});
		}
	};

	/**
	 * Updates user's email and username. Checks for email uniqueness.
	 */
	// Update user profile (name and email)
	updateProfile = async (req: Request, res: Response) => {
		const { name, email } = req.body;
		const sessionUser = req.session.get("user");
		const userId = sessionUser?.id;

		if (!userId) {
			res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Not authenticated",
			});
			return;
		}

		if (!email) {
			res.send({
				statusCode: StatusCode.BadRequest,
				message: "Email is required",
			});
			return;
		}

		try {
			// Check if email is already taken by another user
			const existingUser = await this.sql`
				SELECT id FROM users 
				WHERE email = ${email} AND id != ${userId}
			`;

			if (existingUser.length > 0) {
				res.send({
					statusCode: StatusCode.BadRequest,
					message: "Email is already taken",
				});
				return;
			}

			// Update the user
			const updatedUser = await this.sql`
				UPDATE users 
				SET username = ${name || null}, email = ${email}
				WHERE id = ${userId}
				RETURNING id, username, email, balance
			`;

			if (updatedUser.length === 0) {
				res.send({
					statusCode: StatusCode.NotFound,
					message: "User not found",
				});
				return;
			}

			// Update session data
			req.session.data.userName = updatedUser[0].name;
			req.session.data.userEmail = updatedUser[0].email;

			res.send({
				statusCode: StatusCode.OK,
				message: "Profile updated successfully",
				payload: updatedUser[0],
			});
		} catch (error) {
			console.error("Error updating profile:", error);
			res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Failed to update profile",
			});
		}
	};

	/**
	 * Updates user's password after verifying current password.
	 */
	private updatePassword = async (req: Request, res: Response) => {
		const sessionUser = req.session.get("user");
		if (!sessionUser?.id) {
			return res.send({
				statusCode: StatusCode.Unauthorized,
				message: "Not authenticated",
			});
		}

		const { currentPassword, newPassword } = req.body;

		try {
			await this.authService.updatePassword(
				sessionUser.id,
				currentPassword,
				newPassword,
			);
			return res.send({
				statusCode: StatusCode.OK,
				message: "Password updated successfully",
			});
		} catch (err: any) {
			return res.send({
				statusCode: StatusCode.BadRequest,
				message: err.message || "Password update failed",
			});
		}
	};

	/**
	 * Logs the user out by clearing session info.
	 */
	// Logout user
	private logout = async (req: Request, res: Response) => {
		try {
			this.authService.logout(req.session);

			return res.send({
				statusCode: StatusCode.OK,
				message: "Logged out successfully",
			});
		} catch (error: any) {
			console.error("Logout error:", error);
			return res.send({
				statusCode: StatusCode.InternalServerError,
				message: error.message || "Failed to logout",
			});
		}
	};
}
