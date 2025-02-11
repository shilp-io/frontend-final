import PublicHeader from "@/components/public/PublicHeader";
import { AbstractBackground } from "@/components/ui/landingpage/abstract-background";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PublicHeader />
      {children}
      <AbstractBackground />
    </div>
  );
}
