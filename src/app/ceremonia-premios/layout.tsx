import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ceremonia de Reconocimientos | L.A.M.A. Bike Fest 2026",
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
            "max-snippet": -1,
            "max-image-preview": "none",
            "max-video-preview": -1,
        },
    },
};

export default function CeremoniaPremiosLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}
