import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter is a variable font — one font file serves all weights
// Geist was loading TWO font families (sans + mono) unnecessarily on every page
const inter = Inter({
    subsets: ["latin"],
    display: "swap",          // Prevents invisible text during font load
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Petra Portal",
    description: "Petra Tutors — Student & Tutor Management Portal",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.variable}>
                {children}
            </body>
        </html>
    );
}
