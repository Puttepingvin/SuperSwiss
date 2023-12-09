"use client";

import { usePathname } from "next/navigation";

const pages: string[] = ["Spelare", "Lottning", "Turnering", "Ställning", "Närvaro"];
const pagesEnglish: string[] = ["/players", "/drawing", "/tournament", "/standing", "/term"];

export default function NavBar() {
    const pathname = usePathname();
    const navElements = pages.map((page) => (
        <a href={pagesEnglish[pages.indexOf(page)]} key={pagesEnglish[pages.indexOf(page)]}>
            <li
                className={
                    "inline-block hover:bg-yellow-50 p-2 " +
                    (pagesEnglish[pages.indexOf(page)] === pathname ? "bg-yellow-50 border-b-2 border-b-yellow-700" : "")
                }
            >
                {page}
            </li>
        </a>
    ));
    return (
        <nav className="w-full flex-none border-b-2">
            <ul className="w-fill">{navElements}</ul>
        </nav>
    );
}
