export function AbstractBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none ">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DLBgQX2afQp91OCarNsUwxr6dtvBc0.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.05,
        }}
      />
      <div className="absolute inset-0 grid-background"></div>
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon points="0,100 100,0 100,100" fill="rgba(255,255,255,0.05)" />
        <line
          x1="0"
          y1="0"
          x2="100"
          y2="100"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1="20"
          x2="100"
          y2="80"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1="80"
          x2="100"
          y2="20"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        <circle
          cx="70"
          cy="30"
          r="20"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        <rect
          x="10"
          y="10"
          width="30"
          height="30"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
          transform="rotate(45 25 25)"
        />
      </svg>
    </div>
  );
}
