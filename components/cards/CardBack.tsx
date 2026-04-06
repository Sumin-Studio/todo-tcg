interface CardBackProps {
  className?: string;
}

export default function CardBack({ className }: CardBackProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src="/card-back.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{
        width: "var(--card-width)",
        height: "var(--card-height)",
        borderRadius: "var(--card-radius)",
        objectFit: "cover",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}
