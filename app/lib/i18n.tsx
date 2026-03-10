"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "vi";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const defaultLanguage: Language = "en";

const LanguageContext = createContext<LanguageContextValue>({
  language: defaultLanguage,
  setLanguage: () => {},
});

export const translations = {
  en: {
    siteName: "Valorant Random",
    about: "About",
    aboutDescription:
      "This is a fanmade project to help you randomize teams in Valorant. The system aims to balance roles and add a little luck to your matches!",
    randomTeams: "Random Teams",
    randomAgents: "Random Agents",
    start: "Start →",
    heroTitle: "VALORANT RANDOM TOOL",
    heroSubtitle: "Randomize teams or agents for your custom games 🎮",
    modeTeams:
      "Enter up to 10 players to create balanced teams. You can lock players to specific teams before randomizing.",
    modeAgents: "Skip team creation and instantly generate random agents for your game.",
    playersTitle: "Players",
    playersHint:
      "Enter player names and press Enter.\nYou can add multiple players using commas.\nExample: Jang, Quan, Ha\nYou can lock players to Team A or Team B before randomizing.",
    placeholderPlayer: "Enter player name...",
    maxPlayers: "Maximum 10 players allowed",
    enterPlayerName: "Please enter a player name",
    needAtLeastTwo: "Need at least 2 players",
    needRandomTeams: "Please random teams first",
    randomTeam: "Random Team",
    rolling: "Rolling...",
    matchResult: "Match Result",
    matchResultHint:
      "Press Random Team to divide players. Locked players stay in their teams.",
    nextStep: "Next → Random Agents",
    lockLabel: "LOCK",
    teamA: "Team A",
    teamB: "Team B",
    shareCopied: "✅ Share link copied!",
    gachaResult: "GACHA RESULT",
    rerollAgents: "🔄 Reroll Agents",
    rerollHint: "Reroll agents or generate a random map for your game",
    rollMap: "🎲 Roll Map",
    rollingMap: "Rolling...",
    shareResult: "🔗 Share Result",
    loading: "Loading...",
    langLabel: "Language",
    playersPageTitle: "STEP 1: Add Players",
    playersPageHint:
      "Enter player names and optionally choose roles if you want.\nKeep Random to let the system choose roles for you.\nSelect 1 Team to only randomize agents, or 2 Teams if players are already split into two teams.",
    playersPageTip:
      "Tip: You can leave player names empty and the system will assign default names like Player 1.",
    defaultPlayer: "Player",
    teamModeOne: "1 Team",
    teamModeTwo: "2 Teams",
    roleGuideTitle: "Role Guide",
    roleGuideHint:
      "Pick a role for each player or keep Random to let the system decide.",
    roleRandomNote: "Random will pick any role for you when you generate agents.",
  },
  vi: {
    siteName: "Valorant Random",
    about: "Giới thiệu",
    aboutDescription:
      "Công cụ fanmade này giúp bạn chia team ngẫu nhiên trong Valorant. Hệ thống cố gắng cân bằng vai trò và thêm chút may mắn cho mỗi ván.",
    randomTeams: "Random Teams",
    randomAgents: "Random Agents",
    start: "Bắt đầu →",
    heroTitle: "VALORANT RANDOM TOOL",
    heroSubtitle: "Ngẫu nhiên team hoặc agent cho trận đấu của bạn 🎮",
    modeTeams:
      "Nhập tối đa 10 người chơi và tạo team cân bằng. Bạn có thể khóa người chơi vào team cụ thể trước khi random.",
    modeAgents: "Bỏ qua bước tạo team và ngay lập tức random agent cho trận đấu.",
    playersTitle: "Players",
    playersHint:
      "Nhập tên người chơi và nhấn Enter.\nBạn có thể thêm nhiều người bằng dấu phẩy.\nVí dụ: Jang, Quân, Hà\nCó thể khóa người chơi vào Team A hoặc Team B trước khi random.",
    placeholderPlayer: "Nhập tên người chơi...",
    maxPlayers: "Tối đa 10 người chơi",
    enterPlayerName: "Vui lòng nhập tên người chơi",
    needAtLeastTwo: "Cần ít nhất 2 người chơi",
    needRandomTeams: "Vui lòng random teams trước",
    randomTeam: "Random Team",
    rolling: "Rolling...",
    matchResult: "Match Result",
    matchResultHint:
      "Nhấn Random Team để chia đội. Người chơi bị khóa vẫn giữ nguyên đội.",
    nextStep: "Tiếp → Random Agents",
    lockLabel: "LOCK",
    teamA: "Team A",
    teamB: "Team B",
    shareCopied: "✅ Đã sao chép link chia sẻ!",
    gachaResult: "RANDOM RESULT",
    rerollAgents: "🔄 Reroll Agents",
    rerollHint: "Reroll agent hoặc tạo bản đồ ngẫu nhiên cho trận đấu",
    rollMap: "🎲 Roll Map",
    rollingMap: "Đang quay...",
    shareResult: "🔗 Share Result",
    loading: "Đang tải...",
    langLabel: "Ngôn ngữ",
    playersPageTitle: "Thêm người chơi",
    playersPageHint:
      "Nhập tên người chơi và có thể chọn vai trò nếu muốn.\nGiữ Random để hệ thống tự chọn vai trò cho bạn.\nChọn 1 Team để chỉ random agent, hoặc 2 Teams nếu người chơi đã được chia sẵn thành hai đội.",
    playersPageTip:
      "Mẹo: Bạn có thể để trống tên người chơi và hệ thống sẽ tự đặt tên như Player 1.",
    defaultPlayer: "Player",
    teamModeOne: "1 Team",
    teamModeTwo: "2 Teams",
    roleGuideTitle: "Hướng dẫn vai trò",
    roleGuideHint:
      "Chọn vai trò cho mỗi người chơi hoặc để Random để hệ thống tự chọn.",
    roleRandomNote:
      "Random sẽ chọn một vai trò bất kỳ khi bạn random agent.",
  },
} as const;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return defaultLanguage;
    const stored = window.localStorage.getItem("lang") as Language | null;
    return stored ?? defaultLanguage;
  });

  useEffect(() => {
    window.localStorage.setItem("lang", language);
    document.documentElement.lang = language === "vi" ? "vi" : "en";
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
