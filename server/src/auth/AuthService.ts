// File: server/src/auth/AuthService.ts
import UserModel from "../models/UserModel";

export default class AuthService {
	private userModel: UserModel;

	constructor(userModel: UserModel) {
		this.userModel = userModel;
	}

	async register(username: string, email: string, password: string) {
		const existingUser = await this.userModel.findByEmail(email);
		if (existingUser) {
			throw new Error("Email already registered");
		}
		return await this.userModel.createUser(username, email, password);
	}

	async login(email: string, password: string) {
		const user = await this.userModel.findByEmail(email);
		if (!user || user.password !== password) {
			throw new Error("Invalid credentials");
		}
		return user;
	}
	async getProfile(userId: number) {
		return await this.userModel.getById(userId);
	}
	logout(session: any) {
		session.set("user", null);
	}
	async updateBalance(userId: number, newBalance: number) {
		if (
			typeof newBalance !== "number" ||
			isNaN(newBalance) ||
			newBalance < 0
		) {
			throw new Error("Invalid balance value");
		}
		await this.userModel.updateBalance(userId, newBalance);
	}

	async updatePassword(
		userId: number,
		currentPassword: string,
		newPassword: string,
	) {
		const user = await this.userModel.getById(userId);
		if (!user) throw new Error("User not found");

		if (user.password !== currentPassword) {
            console.log(currentPassword)
            console.log(user.password)
			throw new Error("Current password is incorrect");
		}

		if (newPassword.length < 6) {
			throw new Error("New password must be at least 6 characters");
		}

		await this.userModel.updatePassword(userId, newPassword);
	}
}
