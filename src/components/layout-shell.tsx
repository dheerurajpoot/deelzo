"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MobileBottomNav from "@/components/mobile-bottom-nav";

const HIDE_CHROME_PREFIXES = ["/admin", "/dashboard"];

export default function LayoutShell({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const hideChrome =
		pathname &&
		HIDE_CHROME_PREFIXES.some((prefix) => pathname.startsWith(prefix));

	return (
		<>
			<Navbar />
			{children}
			<MobileBottomNav />
			{!hideChrome && <Footer />}
		</>
	);
}
