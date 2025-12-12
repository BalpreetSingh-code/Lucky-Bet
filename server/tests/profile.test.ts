import { makeHttpRequest } from "./client";
import { StatusCode } from "../src/router/Response";

describe("Profile", () => {
	test("Should reject unauthenticated profile access", async () => {
		const res = await makeHttpRequest("GET", "/profile");
		expect(res.statusCode).toBe(StatusCode.Unauthorized); // Correct for no session
	});
});
