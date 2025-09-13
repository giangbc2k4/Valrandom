import { Suspense } from "react";
import ResultPage from "./ResultPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-12 text-white">Loading...</div>}>
      <ResultPage />
    </Suspense>
  );
}
