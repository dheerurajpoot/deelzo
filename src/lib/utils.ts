import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateResetToken(): string {
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
}

export function extractParamFromRequest(request: Request): string {
	const url = new URL(request.url, process.env.NEXT_PUBLIC_APP_URL);
	const pathParts = url.pathname.split("/");
	return decodeURIComponent(pathParts[pathParts.length - 1]);
}
