import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="section-padding relative bg-white text-black">
      <div className="absolute top-0 left-0 w-full h-1 bg-black" />
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[72px] md:text-[120px] font-black tracking-tighter text-black leading-none mb-8">
            STILL USING THAT DINOSAUR OF A REQUIREMENTS TOOL?
          </h2>
          <p className="text-2xl md:text-3xl font-bold mb-16 text-black">
            IT&apos;S TIME TO UPGRADE. SIGN UP NOW OR WATCH YOUR OLD SOFTWARE
            CRUMBLE UNDER ITS OWN WEIGHT.
          </p>
          <div className="flex flex-col md:flex-row justify-start space-y-8 md:space-y-0 md:space-x-12">
            <Button className="btn-primary bg-black text-white hover:bg-gray-900">
              START FREE TRIAL
            </Button>
            <Button
              variant="outline"
              className="bg-white border-black text-black hover:bg-black hover:text-white"
            >
              SCHEDULE A DEMO
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />
    </section>
  );
}
