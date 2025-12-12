import { ServerResponse } from "http";
import Request from "./Request";
import Cookie from "../auth/Cookie";

/**
 * HTTP status codes used for response classification.
 */
export enum StatusCode {
	OK = 200,
	Created = 201,
	NoContent = 204,
	BadRequest = 400,
	Unauthorized = 401,
	Forbidden = 403,
	NotFound = 404,
	InternalServerError = 500,
}

/**
 * Common MIME content types.
 */
export enum ContentType {
	JSON = "application/json",
	HTML = "text/html",
}

/**
 * Props used to construct a structured response payload.
 */
export interface ResponseProps {
	statusCode: StatusCode;
	message: string;
	payload?: any;
	template?: string;
	redirect?: string;
}
/**
 * A class that wraps the `ServerResponse` object and provides
 * a method for sending JSON responses. This class is used by
 * the Router to send responses to the client. It is also used
 * by the controllers to send responses to the client.
 */
export default class Response {
	constructor(
		public request: Request,
		public res: ServerResponse,
		public cookies: Cookie[] = [],
	) {}

	/**
	 * Sends a JSON response to the client. The response is
	 * formatted as an object with a `message` property and a
	 * `payload` property. The `message` property is a string
	 * that describes the response. The `payload` property is
	 * an object that contains the data to be sent to the client.
	 * @param statusCode
	 * @param message
	 * @param payload
	 */
	send = async (props: ResponseProps) => {
		const { statusCode, message, payload, redirect, template } = props;

		console.log(
			`<<< ${statusCode} ${message} ${payload ? JSON.stringify(payload, null, 2) : ""}`,
		);
		this.request;
		this.res.writeHead(statusCode, {
			"Content-Type": ContentType.JSON,
			// echo back the request’s Origin so credentials can be sent
			"Access-Control-Allow-Origin":
				this.request.req.headers.origin || "*",
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		});

		this.res.end(JSON.stringify({ message, payload }, null, 2));
	};
	/**
	 * Sets a cookie in the response.
	 * Every time this method is called, the `Set-Cookie` header
	 * is updated with the new cookie (and all cookies that were
	 * added before it, if any), and the new cookie is added to the
	 * `cookies` array.
	 */
	public setCookie(cookie: Cookie) {
		this.cookies.push(cookie);
		this.res.setHeader("Set-Cookie", this.stringifyCookies());
	}

	/**
	 * Converts the `cookies` array to a string that can be used
	 * in the `Set-Cookie` header. This method is called every time
	 * a cookie is added to the `cookies` array.
	 */
	private stringifyCookies() {
		return this.cookies.map((cookie) => cookie.toString());
	}
}
