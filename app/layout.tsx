import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "./NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Schacklottning KSK",
    description: "Schacklottning för kungsbacka schackklubb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className + " text-neutral-700 flex flex-wrap"}>
                <div className="w-full text-5xl p-5 border-b-4 border-b-yellow-700 flex-none pl-2 font-extrabold">Schacklottning</div>
                <NavBar />
                <main className="min-h-full p-t-4 md:p-4 flex-auto">{children}</main>
            </body>
        </html>
    );
}
