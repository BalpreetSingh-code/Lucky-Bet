// File: server/models/UserModel.ts
import postgres from "postgres";

export default class UserModel {
	private sql: postgres.Sql;

	constructor(sql: postgres.Sql) {
		this.sql = sql;
	}

	async findByEmail(email: string) {
		const users = await this.sql`
			SELECT * FROM users WHERE email = ${email}
		`;
		return users[0] || null;
	}

	async createUser(username: string, email: string, password: string) {
		const result = await this.sql`
			INSERT INTO users (username, email, password, balance)
			VALUES (${username}, ${email}, ${password}, DEFAULT)
			RETURNING id, username, email, balance
		`;
		return result[0];
	}

	async getById(id: number) {
		const users = await this.sql`
		SELECT id, username, email, balance, password
		FROM users
		WHERE id = ${id}
	`;
		return users[0] || null;
	}

	async updateBalance(id: number, newBalance: number) {
		await this.sql`
		UPDATE users SET balance = ${newBalance}
		WHERE id = ${id}
	`;
	}

	async updatePassword(id: number, newPassword: string) {
		await this.sql`
		UPDATE users SET password = ${newPassword}
		WHERE id = ${id}
	`;
	}
}
