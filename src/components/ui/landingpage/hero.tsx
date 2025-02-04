import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-white" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white" />
      <div className="absolute inset-0 bg-black opacity-0" />
      <div className="container mx-auto px-4 py-32 relative z-20">
        <h1 className="text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] xl:text-[112px] font-black leading-none mb-8 text-stroke animate-glow"></h1>
        <h2 className="text-[36px] sm:text-[48px] md:text-[64px] lg:text-[80px] xl:text-[96px] font-black leading-none mb-16 text-white">
          REQUIREMENT TOOLS SUCK. OURS DOESN&apos;T.
        </h2>
        <div className="space-y-4 mb-16">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold">
            WRITE LIKE WORD
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold">
            ORGANIZE LIKE EXCEL
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold">
            LET AI DO THE GRUNT WORK.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-start items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <Button className="btn-primary w-full sm:w-auto">
            GET STARTED FREE
          </Button>
          <Button
            variant="outline"
            className="btn-secondary w-full sm:w-auto hover:text-black"
          >
            WATCH DEMO
          </Button>
        </div>
      </div>
    </section>
  );
}
