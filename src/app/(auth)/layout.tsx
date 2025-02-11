import PublicHeader from "@/components/public/PublicHeader";
import { AbstractBackground } from "@/components/ui/landingpage/abstract-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AbstractBackground />
      <PublicHeader />
      {children}
    </div>
  );
}
