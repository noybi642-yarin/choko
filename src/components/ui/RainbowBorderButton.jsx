export function RainbowBorderButton({ children, onClick, className = '' }) {
  return (
    <button className={`rainbow-btn ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
