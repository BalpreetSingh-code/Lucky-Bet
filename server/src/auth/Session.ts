import Cookie from "./Cookie";

/**
 * Represents a single user session.
 * Stores session ID, arbitrary data (key-value), and a cookie object.
 * Provides methods for session data manipulation and lifecycle control.
 */
export default class Session {
	id: string;
	data: Record<string, any>;
	cookie: Cookie;

	/**
	 * Constructs a new Session.
	 * @param id Unique session identifier (usually a random string).
	 * @param data Optional initial data to associate with this session.
	 */
	constructor(id: string, data = {}) {
		this.id = id;
		this.data = data;
		this.cookie = new Cookie("session_id", id);
	}

	/**
	 * Retrieves a value from the session by key.
	 * @param name The key to fetch.
	 * @returns The value, or null if not present.
	 */
	get(name: string) {
		return this.data[name] ?? null;
	}

	/**
	 * Sets a session value under a given key.
	 * @param name The key to set.
	 * @param value The value to associate.
	 */
	set(name: string, value: any) {
		this.data[name] = value;
	}

	/**
	 * Checks whether a value is stored under the given key.
	 * @param name The key to check.
	 * @returns True if present, false otherwise.
	 */
	exists(name: string) {
		return this.get(name) !== null;
	}

	/**
	 * Resets the cookie's expiration time.
	 * Typically called on activity to keep sessions alive.
	 * @param time Milliseconds from now until expiration.
	 */
	refresh(time = Cookie.DEFAULT_TIME) {
		this.cookie.setExpires(time);
	}

	/**
	 * Destroys the session data and expires the cookie.
	 * Used during logout or forced expiration.
	 */
	destroy() {
		this.data = {};
		this.cookie.setExpires();
	}

	/**
	 * Checks if the session has expired.
	 * @returns True if expired, false otherwise.
	 */
	isExpired() {
		return this.cookie.getExpires() <= Date.now();
	}
}
