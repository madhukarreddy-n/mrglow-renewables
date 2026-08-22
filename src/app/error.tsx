"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="grid min-h-[50vh] place-items-center p-8 text-center">
      <div>
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="mt-3 text-muted">Please try again. If this continues, contact Mr.GLOW.</p>
        <button className="btn-primary mt-6" onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
