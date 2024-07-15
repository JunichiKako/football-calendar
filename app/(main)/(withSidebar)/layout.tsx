import Sidebar from "@/components/sidebar/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="mt-32 px-4 lg:px-11 lg:ml-64">{children}</div>
    </>
  );
}
