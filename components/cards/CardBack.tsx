interface CardBackProps {
  className?: string;
}

export default function CardBack({ className }: CardBackProps) {
  return (
    <div
      className={className}
      style={{
        width: "var(--card-width)",
        height: "var(--card-height)",
        borderRadius: "var(--card-radius)",
        background:
          "linear-gradient(180deg, #f7f7f7 0%, #d7d7d7 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow:
          "inset 0 12px 0 rgba(255,255,255,0.95), 0 10px 18px rgba(0,0,0,0.12)",
        border: "3px solid #d2d2d2",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: "80%",
          height: "80%",
          border: "2px solid rgba(32,32,32,0.16)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.58) 0, rgba(255,255,255,0.58) 8px, rgba(210,210,210,0.45) 8px, rgba(210,210,210,0.45) 16px)",
        }}
      >
        <span
          style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "rgba(32,32,32,0.3)",
            textTransform: "uppercase",
            fontFamily: "var(--font-title), monospace",
          }}
        >
          TO-DO
        </span>
      </div>
    </div>
  );
}
