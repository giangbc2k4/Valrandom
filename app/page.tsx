"use client";

import { Shuffle, Swords } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import agentsData from "./data/agents.json";
import { translations, useLanguage } from "./lib/i18n";

type FeatureAgent = {
  name: string;
  image: string;
};

export default function Home() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [activeAgent, setActiveAgent] = useState(0);
  const agents = useMemo(
    () => (agentsData as FeatureAgent[]).map((agent) => ({
      name: agent.name,
      src: agent.image,
    })),
    []
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.hidden) return;
      setActiveAgent((current) => (current + 1) % agents.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [agents.length]);

  const visibleAgents = [-2, -1, 0, 1, 2].map((offset) => {
    const index = (activeAgent + offset + agents.length) % agents.length;

    return {
      ...agents[index],
      offset,
    };
  });

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-valorant-dark text-white">
      <div className="absolute inset-0 tactical-grid opacity-45" />
      <div className="absolute left-0 top-0 h-full w-1/2 bg-[linear-gradient(110deg,rgba(255,70,85,0.2),transparent_45%)]" />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-73px)] max-w-[1640px] items-stretch gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:py-16">
        <div className="flex min-h-[610px] flex-col justify-center lg:h-[650px]">
          <div className="mb-7 h-1 w-24 bg-red-500" />
          <h1 className="valorant-title max-w-4xl text-5xl leading-[0.95] text-white sm:text-6xl lg:min-h-[138px] lg:text-7xl">
            {t.heroTitle}
          </h1>
          <p className="mt-6 h-20 max-w-2xl overflow-hidden text-lg leading-8 text-gray-300 sm:text-xl">
            {t.heroSubtitle}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ModePanel
              title={t.randomTeams}
              description={t.modeTeams}
              action={t.start}
              icon={<Swords size={24} />}
              tone="red"
              onClick={() => router.push("/teams")}
            />
            <ModePanel
              title={t.randomAgents}
              description={t.modeAgents}
              action={t.start}
              icon={<Shuffle size={24} />}
              tone="blue"
              onClick={() => router.push("/players")}
            />
          </div>
        </div>

        <div className="relative min-h-[610px] overflow-hidden lg:h-[650px]">
          <div className="absolute inset-0">
            {visibleAgents.map((agent) => {
              const offset = agent.offset;
              const distance = Math.abs(offset);
              const visible = distance <= 1;
              const x = offset * 282;
              const width = distance === 0 ? 320 : 260;
              const height = distance === 0 ? 540 : 450;
              const top = distance === 0 ? 54 : 99;
              const entering = distance > 1 && distance <= 2;
              const opacity = visible ? 1 : entering ? 0.18 : 0;
              const blur = distance === 0 ? 0 : distance === 1 ? 0.35 : 5;
              const zIndex = 100 - distance * 20;

              return (
                <div
                  key={agent.name}
                  className="agent-card-frame absolute overflow-hidden border border-white/[0.08] shadow-[0_22px_60px_rgba(0,0,0,0.45)] transition-[left,top,width,height,opacity,filter] duration-1000 ease-out will-change-transform"
                  style={{
                    width,
                    height,
                    left: `calc(50% + ${x}px)`,
                    top,
                    transform: "translateX(-50%)",
                    opacity,
                    zIndex,
                    filter: `blur(${blur}px)`,
                    pointerEvents: visible ? "auto" : "none",
                  }}
                >
                  <Image
                    src={agent.src}
                    alt={agent.name}
                    fill
                    sizes="270px"
                    className="object-cover object-top"
                    priority={distance === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-300">
                      Agent
                    </p>
                    <h2 className="mt-1 text-xl font-black uppercase text-white">{agent.name}</h2>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function ModePanel({
  title,
  description,
  action,
  icon,
  tone,
  onClick,
}: {
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
  tone: "red" | "blue";
  onClick: () => void;
}) {
  const toneClasses =
    tone === "red"
      ? "hover:border-red-400/70 hover:shadow-[0_0_34px_rgba(255,70,85,0.24)] text-red-300"
      : "hover:border-blue-400/70 hover:shadow-[0_0_34px_rgba(53,168,255,0.22)] text-blue-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group panel cut-corners flex h-[318px] flex-col p-6 text-left transition duration-300 ${toneClasses}`}
    >
      <span className="mb-5 flex h-12 w-12 items-center justify-center border border-current/40 bg-current/10">
        {icon}
      </span>
      <h2 className="min-h-[64px] text-2xl font-black uppercase tracking-[0.04em] text-white">{title}</h2>
      <p className="mt-3 h-[96px] overflow-hidden text-sm leading-6 text-gray-300">{description}</p>
      <div className="mt-auto flex items-center gap-3 text-sm font-black uppercase tracking-[0.14em]">
        {action}
        <span className="h-px flex-1 bg-current/50 transition group-hover:bg-current" />
      </div>
    </button>
  );
}
