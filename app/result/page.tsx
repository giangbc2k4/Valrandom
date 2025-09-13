import { Suspense } from "react";
import ResultPage from "./ResultPage";

// ⛔ Chặn Next.js pre-render (SSG)
// ép trang này chỉ render lúc runtime (CSR)
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-12 text-white">Loading...</div>}>
      <ResultPage />
    </Suspense>
  );
}
