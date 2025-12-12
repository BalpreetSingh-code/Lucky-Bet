import UserModel from "../models/UserModel";

export default class GameService {
	private userModel: UserModel;

	constructor(userModel: UserModel) {
		this.userModel = userModel;
	}

	async playCoinFlip(
		userId: number,
		guess: "heads" | "tails",
		amount: number,
	) {
		if (!guess || typeof amount !== "number" || amount <= 0) {
			throw new Error("Invalid bet input");
		}

		const user = await this.userModel.getById(userId);
		if (!user) throw new Error("User not found");
		if (amount > user.balance) throw new Error("Insufficient funds");

		const outcome = Math.random() < 0.5 ? "heads" : "tails";
		const win = guess === outcome;
		const payout = win ? amount * 1.95 : 0;
		const newBalance = user.balance - amount + payout;

		await this.userModel.updateBalance(userId, newBalance);

		return {
			outcome,
			win,
			payout,
			newBalance,
		};
	}
	async playRoulette(userId: number, betType: string, amount: number) {
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

		const getRandomResult = () => Math.floor(Math.random() * 37);
		const getResultDetails = (n: number) =>
			ROULETTE_NUMBERS.find((x) => x.number === n);

		const user = await this.userModel.getById(userId);
		if (!user) throw new Error("User not found");
		if (amount > user.balance) throw new Error("Insufficient funds");

		const resultNumber = getRandomResult();
		const result = getResultDetails(resultNumber);
		if (!result) {
			throw new Error(
				`Invalid spin result: ${resultNumber} not in ROULETTE_NUMBERS`,
			);
		}

		let win = false;
		let payoutMultiplier = 0;

		if (betType === result.number.toString()) {
			win = true;
			payoutMultiplier = 35;
		} else if (betType === result.color) {
			win = true;
			payoutMultiplier = 1;
		} else if (
			betType === "even" &&
			resultNumber !== 0 &&
			resultNumber % 2 === 0
		) {
			win = true;
			payoutMultiplier = 1;
		} else if (betType === "odd" && resultNumber % 2 === 1) {
			win = true;
			payoutMultiplier = 1;
		} else if (
			betType === "1-12" &&
			resultNumber >= 1 &&
			resultNumber <= 12
		) {
			win = true;
			payoutMultiplier = 2;
		} else if (
			betType === "13-24" &&
			resultNumber >= 13 &&
			resultNumber <= 24
		) {
			win = true;
			payoutMultiplier = 2;
		} else if (
			betType === "25-36" &&
			resultNumber >= 25 &&
			resultNumber <= 36
		) {
			win = true;
			payoutMultiplier = 2;
		}

		const payout = win ? amount * payoutMultiplier : 0;
		const newBalance = win
			? user.balance + payout 
			: user.balance - amount;

		await this.userModel.updateBalance(userId, newBalance);

		return {
			result: result.number,
			color: result.color,
			win,
			payout,
			newBalance,
		};
	}
}
