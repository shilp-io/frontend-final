export function Contact() {
  return (
    <section
      id="contact"
      className="flex items-center justify-center bg-black text-white relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-white" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white" />
      <div className="absolute inset-0 bg-black opacity-0" />
      <div className="container mx-auto px-4 py-16 relative z-20i text-center">
        <h2 className="text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] xl:text-[112px] font-black leading-none mb-8 text-white">
          CONTACT
        </h2>
        <div className="space-y-4 ">
          <p className="text-2xl md:text-3xl font-bold text-primary">
            hello@atoms.tech
          </p>
        </div>
      </div>
    </section>
  );
}
