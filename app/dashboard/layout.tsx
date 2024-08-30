import Header from "@/components/Header";
import { ClerkLoaded } from "@clerk/nextjs";

function DashboaredLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkLoaded>
      <div className="w-full flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      ;
    </ClerkLoaded>
  );
}

export default DashboaredLayout;
