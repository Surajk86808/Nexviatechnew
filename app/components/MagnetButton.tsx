import { useRef, ReactNode, MouseEvent } from "react";

interface MagnetButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const MagnetButton = ({ children, className = "", onClick, disabled = false, type = "button" }: MagnetButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };

  const handleMouseLeave = () => {
    const btn = ref.current;
    if (!btn) return;
    btn.style.transform = "translate(0, 0)";
  };

  return (
    <button
      ref={ref}
      className={`transition-transform duration-300 ease-out ${className}`}
      type={type}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      suppressHydrationWarning
    >
      {children}
    </button>
  );
};

export default MagnetButton;
