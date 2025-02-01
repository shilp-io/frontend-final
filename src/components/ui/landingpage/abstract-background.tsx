export function AbstractBackground() {
  return (
    <div className="inset-0 overflow-hidden pointer-events-none ">
      <div
        className="inset-0"
        style={{
          backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DLBgQX2afQp91OCarNsUwxr6dtvBc0.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.05,
        }}
      />
      <div className="absolute inset-0 grid-background"></div>
    </div>
  );
}
