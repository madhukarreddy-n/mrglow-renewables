"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en-IN">
      <body className="grid min-h-screen place-items-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Service unavailable</h1>
          <p className="mt-2 text-sm">Please try again shortly.</p>
          <button className="mt-4 rounded-full bg-[#7cb342] px-6 py-2" onClick={reset}>
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
