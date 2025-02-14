import { AbstractBackground } from "@/components/ui/landingpage/abstract-background";
import { Navbar } from "@/components/ui/landingpage/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AbstractBackground />
      <Navbar />
      {children}
    </div>
  );
}
