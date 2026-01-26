import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const Tooltip = ({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [tooltipElement, setTooltipElement] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    const el = document.getElementById("tooltip-portal");
    if (!el) {
      const div = document.createElement("div");
      div.id = "tooltip-portal";
      document.body.appendChild(div);
      setTimeout(() => setTooltipElement(div), 0);
    } else {
      setTimeout(() => setTooltipElement(el), 0);
    }
  }, []);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setCoords({
      top: rect.top + window.scrollY + rect.height,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </div>
      {isHovered &&
        tooltipElement &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, 8px)",
              background: "white",
              color: "black",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              zIndex: 9999,
              whiteSpace: "nowrap",
            }}
            className="tooltip-content text-xs rounded-lg py-1 px-2"
          >
            {text}
          </div>,
          tooltipElement,
        )}
    </>
  );
};

export default Tooltip;
