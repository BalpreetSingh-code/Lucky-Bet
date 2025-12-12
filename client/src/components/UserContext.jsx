import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
	const [user, setUser] = useState(null);

	// On mount, try fetching current user/session
	useEffect(() => {
		console.log("⚙️  UserProvider fetching profile…");
		fetch("http://localhost:3000/profile", { credentials: "include" })
			.then((r) => {
				console.log("⚙️  profile HTTP status:", r.status);
				return r.json();
			})
			.then((data) => {
				console.log("⚙️  profile JSON:", data);
				if (data.payload?.id) {
					console.log("⚙️  setting user to:", data.payload);
					setUser({
						id: data.payload.id,
						username: data.payload.username,
						email: data.payload.email,
						balance: data.payload.balance,
					});
				}
			})
			.catch((err) => console.error("⚙️  profile fetch error:", err));
	}, []);

	const updateBalance = (newBal) => {
		setUser((u) => ({ ...u, balance: newBal }));
	};

	return (
		<UserContext.Provider value={{ user, setUser, updateBalance }}>
			{children}
		</UserContext.Provider>
	);
}
