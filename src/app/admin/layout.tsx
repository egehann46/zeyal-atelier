export const dynamic = "force-dynamic";
import LogoutButton from "./LogoutButton";
import HomeButton from "./HomeButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF6F1] text-[#363636]">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-abril text-logo">Yönetim Paneli</h1>
          <div className="ml-auto flex items-center gap-2">
            <HomeButton />
            <LogoutButton />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
} 