export default function AnimatedTitle({ text }) {
  return (
    <div className="title-container">
      <div className="share first-container">
        <h1 aria-label={text}>
          {text.split("").map((ch, i) => (
            <span key={i}>{ch === " " ? "\u00A0" : ch}</span>
          ))}
        </h1>
      </div>
    </div>
  );
}
