"use client";

export default function OrderButton({ href, disabled, children }: { href: string; disabled?: boolean; children: React.ReactNode }) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (disabled) {
      e.preventDefault();
      alert("Ürün stoklarda tükenmiştir.");
    }
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition ${disabled ? "bg-gray-400 cursor-not-allowed text-white" : "bg-[#969B38] hover:bg-[#7f8430] text-white"}`}
      aria-disabled={disabled || undefined}
    >
      {children}
    </a>
  );
} 