"use client";

import { useEffect, useMemo, useState } from "react";

type TimeLeft = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

const EVENT_DATE = new Date("2026-06-26T12:00:00-05:00");

function getTimeLeft(targetDate: Date): TimeLeft {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
}

function TimeCard({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex-1 rounded-lg border border-orange-400/35 bg-black/55 px-2 py-2 text-center backdrop-blur">
            <p className="font-display text-xl font-extrabold leading-none text-orange-300 sm:text-3xl">
                {String(value).padStart(2, "0")}
            </p>
            <p className="mt-0.5 text-[8px] uppercase tracking-[0.15em] text-zinc-300 sm:mt-1 sm:text-[11px]">
                {label}
            </p>
        </div>
    );
}

export function CountdownTimer() {
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
        getTimeLeft(EVENT_DATE),
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft(EVENT_DATE));
        }, 1000);
        return () => clearInterval(timer);
    }, [mounted]);

    const cards = useMemo(
        () => [
            { value: timeLeft.days, label: "Días" },
            { value: timeLeft.hours, label: "Horas" },
            { value: timeLeft.minutes, label: "Minutos" },
            { value: timeLeft.seconds, label: "Segundos" },
        ],
        [timeLeft],
    );

    if (!mounted) {
        return (
            <div className="mt-7">
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-zinc-300">
                    Cuenta regresiva oficial
                </p>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                    {["Días", "Horas", "Minutos", "Segundos"].map((label) => (
                        <div
                            key={label}
                            className="flex-1 rounded-lg border border-orange-400/35 bg-black/55 px-2 py-2 text-center backdrop-blur"
                            aria-hidden
                        >
                            <div className="h-6 sm:h-9" />
                            <div className="mt-0.5 h-[8px] sm:mt-1 sm:h-[10px]" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-7">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-zinc-300">
                Cuenta regresiva oficial
            </p>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                {cards.map((card) => (
                    <TimeCard key={card.label} value={card.value} label={card.label} />
                ))}
            </div>
        </div>
    );
}
