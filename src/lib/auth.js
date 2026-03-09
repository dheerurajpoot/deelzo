import jwt from "jsonwebtoken";

export const getDataFromToken = (request) => {
	try {
		const token = request.cookies.get("token")?.value || "";
		if (!token) return null;
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
		return decodedToken.userId;
	} catch (error) {
		return null;
	}
};
