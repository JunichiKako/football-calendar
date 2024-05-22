import Footer from "@/components/footer";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function Layout({ children }: { children: React.ReactNode}) {
  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
