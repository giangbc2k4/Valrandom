"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center px-6 py-10 mx-auto">
      {/* Hero Banner */}
      <div className="w-full bg-gradient-to-r from-red-900 via-black to-gray-900 rounded-xl p-10 mb-12 shadow-lg relative overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-extrabold text-red-500 drop-shadow-[0_0_20px_rgba(255,70,85,0.8)] mb-4">
          VALORANT GACHA
        </h1>
        <p className="text-gray-300 text-lg md:text-xl">
          Tạo đội ngẫu nhiên, cân bằng vai trò 🎮
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(255,70,85,0.5)] transition-transform">
          <div className="text-4xl mb-3">📝</div>
          <h2 className="text-xl font-bold text-red-400 mb-3">Step 1</h2>
          <p className="text-gray-300">Nhập tên cho từng người chơi trong đội của bạn.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(255,70,85,0.5)] transition-transform">
          <div className="text-4xl mb-3">🎯</div>
          <h2 className="text-xl font-bold text-red-400 mb-3">Step 2</h2>
          <p className="text-gray-300">Chọn vai trò nếu muốn, hoặc để hệ thống tự chọn.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(255,70,85,0.5)] transition-transform">
          <div className="text-4xl mb-3">🎲</div>
          <h2 className="text-xl font-bold text-red-400 mb-3">Step 3</h2>
          <p className="text-gray-300">
            Nhận ngay một đội hình ngẫu nhiên, cân bằng role!
          </p>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={() => router.push("/players")}
        className="px-12 py-4 text-xl font-bold bg-red-600 hover:bg-red-700 transform hover:scale-110 hover:shadow-[0_0_30px_rgba(255,70,85,0.8)] transition-all shadow-[0_0_20px_rgba(255,70,85,0.6)] -skew-x-12 rounded-lg"
      >
        <span className="inline-block skew-x-12">Bắt đầu</span>
      </button>


    </div>
  );
}
