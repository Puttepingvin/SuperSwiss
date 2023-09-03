"use client";

import { usePathname } from "next/navigation";

const pages: string[] = ["Spelare", "Lottning", "Turnering"];
const pagesEnglish: string[] = ["/players", "/drawing", "/tournament"];

export default function NavBar() {
    const pathname = usePathname();
    const navElements = pages.map((page) => (
        <a href={pagesEnglish[pages.indexOf(page)]} key={pagesEnglish[pages.indexOf(page)]}>
            <li
                className={
                    "w-fill hover:bg-yellow-50 p-2 " +
                    (pagesEnglish[pages.indexOf(page)] === pathname ? "bg-yellow-50 border-r-2 border-r-yellow-700" : "")
                }
            >
                {page}
            </li>
        </a>
    ));
    return (
        <nav className="w-32 text-right h-screen flex-none border-r-2 pt-5">
            <ul className="w-fill">{navElements}</ul>
        </nav>
    );
}
