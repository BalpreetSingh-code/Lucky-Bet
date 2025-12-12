import { makeHttpRequest } from "./client";
import { StatusCode } from "../src/router/Response";

describe("Auth", () => {
	test("Should register a new user", async () => {
		const res = await makeHttpRequest("POST", "/register", {
			username: "testuser",
			email: `test-${Date.now()}@example.com`, // 👈 ensure uniqueness
			password: "123456",
		});

		console.log("Register response:", res.body); // 👈 add this temporarily

		expect(res.statusCode).toBe(StatusCode.Created);
		expect(res.body.payload.email).toContain("@example.com");
	});

	test("Should not allow duplicate email registration", async () => {
		await makeHttpRequest("POST", "/register", {
			username: "user1",
			email: "dupe@example.com",
			password: "123",
		});

		const res = await makeHttpRequest("POST", "/register", {
			username: "user2",
			email: "dupe@example.com",
			password: "456",
		});

		expect(res.statusCode).toBe(StatusCode.BadRequest);
		expect(res.body.message).toMatch(/already/i);
	});

	test("Should log in with valid credentials", async () => {
		await makeHttpRequest("POST", "/register", {
			username: "loginuser",
			email: "log@example.com",
			password: "pass123",
		});

		const res = await makeHttpRequest("POST", "/login", {
			email: "log@example.com",
			password: "pass123",
		});

		expect(res.statusCode).toBe(StatusCode.OK);
		expect(res.body.payload.username).toBe("loginuser");
	});

	test("Should reject login with wrong password", async () => {
		const res = await makeHttpRequest("POST", "/login", {
			email: "log@example.com",
			password: "wrongpass",
		});

		expect(res.statusCode).toBe(StatusCode.Unauthorized);
	});
});
