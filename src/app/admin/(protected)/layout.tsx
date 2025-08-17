import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
	const c = await cookies();
	const isAuth = c.get("admin_auth")?.value === "1";
	if (!isAuth) {
		redirect("/admin/login");
	}
	return <>{children}</>;
} 