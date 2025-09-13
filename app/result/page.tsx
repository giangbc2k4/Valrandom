import { Suspense } from "react";
import ResultPage from "./ResultPage";


export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-12 text-white">Loading...</div>}>
      <ResultPage />
    </Suspense>
  );
}
