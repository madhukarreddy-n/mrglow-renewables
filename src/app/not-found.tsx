import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center p-8 text-center">
      <div>
        <h1 className="font-display text-4xl">Page not found</h1>
        <p className="mt-3 text-muted">The page you requested is not available.</p>
        <Link href="/" className="btn-primary mt-6">Return home</Link>
      </div>
    </div>
  );
}
