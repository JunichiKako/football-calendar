import Sidebar from "@/components/sidebar/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex">
        <Sidebar />
        <main className="py-6 px-10 flex-1">{children}</main>
      </div>
    </>
  );
}
