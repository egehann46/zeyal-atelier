"use client";

export default function LogoutButton() {
	async function onClick() {
		try {
			await fetch("/api/admin/logout", { method: "POST" });
		} catch {}
		window.location.href = "/admin/login";
	}
	return (
		<button onClick={onClick} className="px-3 py-2 rounded-md bg-red-600 text-white ml-auto">Çıkış</button>
	);
} 