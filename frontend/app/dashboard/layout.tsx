import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { StockProvider } from "./StockContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StockProvider>
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          <div className="max-w-7xl mx-auto p-8">
            <TopBar />
            {children}
          </div>
        </main>
      </div>
    </StockProvider>
  );
}
