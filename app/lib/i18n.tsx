"use client";

import React, { createContext, useContext } from "react";

export type Language = "en" | "vi";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const defaultLanguage: Language = "vi";

const LanguageContext = createContext<LanguageContextValue>({
  language: defaultLanguage,
  setLanguage: () => {},
});

export const translations = {
  en: {
    siteName: "Valorant Random",
    about: "About",
    aboutDescription:
      "A fanmade Valorant utility for custom games: split teams, lock players, choose roles, and roll agents or maps in a few clicks.",
    randomTeams: "Random Teams",
    randomAgents: "Random Agents",
    start: "Start",
    heroTitle: "VALORANT RANDOM TOOL",
    heroSubtitle: "Build fair custom lobbies with fast team, agent, and map rolls.",
    modeTeams:
      "Enter up to 10 players, lock key names to Team A or Team B, then roll a balanced lobby.",
    modeAgents:
      "Skip team splitting and go straight to agent roles for one squad or two prepared teams.",
    playersTitle: "Players",
    playersHint:
      "Enter player names and press Enter.\nYou can add multiple players using commas.\nExample: Jang, Quan, Ha\nLock players to Team A or Team B before randomizing when needed.",
    placeholderPlayer: "Enter player name...",
    maxPlayers: "Maximum 10 players allowed",
    enterPlayerName: "Please enter a player name",
    needAtLeastTwo: "Need at least 2 players",
    needRandomTeams: "Please randomize teams first",
    randomTeam: "Random Team",
    rolling: "Rolling...",
    matchResult: "Match Result",
    matchResultHint:
      "Press Random Team to divide players. Locked players stay with their selected side.",
    nextStep: "Next: Random Agents",
    lockLabel: "LOCK",
    teamA: "Team A",
    teamB: "Team B",
    shareCopied: "Share link copied!",
    gachaResult: "RANDOM RESULT",
    rerollAgents: "Reroll Agents",
    rerollHint: "Reroll agents or generate a random map for your game.",
    rollMap: "Roll Map",
    rollingMap: "Rolling...",
    shareResult: "Share Result",
    loading: "Loading...",
    langLabel: "Language",
    playersPageTitle: "Add Players",
    playersPageHint:
      "Enter player names only.\nAgent roles can be chosen later on the draft screen.\nSelect 1 Team for one squad, or 2 Teams if players are already split.",
    playersPageTip:
      "Tip: empty names are filled automatically as Player 1, Player 2, and so on.",
    defaultPlayer: "Player",
    teamModeOne: "1 Team",
    teamModeTwo: "2 Teams",
    roleGuideTitle: "Role Guide",
    roleGuideHint:
      "Pick a role for each player or keep Random to let the system decide.",
    roleRandomNote: "Random can pick any role when you generate agents.",
  },
  vi: {
    siteName: "Valorant Random",
    about: "Giới thiệu",
    aboutDescription:
      "Công cụ fanmade cho custom Valorant: chia team, khóa người chơi, chọn role, rồi random agent hoặc map chỉ trong vài thao tác.",
    randomTeams: "Random Team",
    randomAgents: "Random Agent",
    start: "Bắt đầu",
    heroTitle: "VALORANT RANDOM TOOL",
    heroSubtitle: "Tạo lobby custom công bằng hơn với team, agent và map ngẫu nhiên.",
    modeTeams:
      "Nhập tối đa 10 người chơi, khóa tên quan trọng vào Team A hoặc Team B, rồi random đội hình cân bằng.",
    modeAgents:
      "Bỏ qua bước chia team và vào thẳng phần chọn role cho một đội hoặc hai đội đã chia sẵn.",
    playersTitle: "Người chơi",
    playersHint:
      "Nhập tên người chơi và nhấn Enter.\nCó thể thêm nhiều người bằng dấu phẩy.\nVí dụ: Jang, Quân, Hà\nCó thể khóa người chơi vào Team A hoặc Team B trước khi random.",
    placeholderPlayer: "Nhập tên người chơi...",
    maxPlayers: "Tối đa 10 người chơi",
    enterPlayerName: "Vui lòng nhập tên người chơi",
    needAtLeastTwo: "Cần ít nhất 2 người chơi",
    needRandomTeams: "Vui lòng random team trước",
    randomTeam: "Random Team",
    rolling: "Đang quay...",
    matchResult: "Kết quả trận",
    matchResultHint:
      "Nhấn Random Team để chia đội. Người chơi bị khóa sẽ giữ nguyên đội đã chọn.",
    nextStep: "Tiếp: Random Agent",
    lockLabel: "KHÓA",
    teamA: "Team A",
    teamB: "Team B",
    shareCopied: "Đã sao chép link chia sẻ!",
    gachaResult: "KẾT QUẢ RANDOM",
    rerollAgents: "Reroll Agent",
    rerollHint: "Reroll agent hoặc tạo bản đồ ngẫu nhiên cho trận đấu.",
    rollMap: "Roll Map",
    rollingMap: "Đang quay...",
    shareResult: "Chia sẻ kết quả",
    loading: "Đang tải...",
    langLabel: "Ngôn ngữ",
    playersPageTitle: "Thêm người chơi",
    playersPageHint:
      "Chỉ nhập tên người chơi ở bước này.\nRole agent có thể chọn sau ở màn hình draft.\nChọn 1 Team cho một đội, hoặc 2 Teams nếu người chơi đã được chia sẵn.",
    playersPageTip:
      "Mẹo: bạn có thể để trống tên, hệ thống sẽ tự đặt như Player 1, Player 2.",
    defaultPlayer: "Player",
    teamModeOne: "1 Team",
    teamModeTwo: "2 Teams",
    roleGuideTitle: "Hướng dẫn role",
    roleGuideHint:
      "Chọn role cho từng người chơi hoặc để Random để hệ thống tự chọn.",
    roleRandomNote: "Random sẽ chọn một role bất kỳ khi bạn tạo agent.",
  },
} as const;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const value: LanguageContextValue = {
    language: defaultLanguage,
    setLanguage: () => {},
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
