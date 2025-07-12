import React from "react";

/**
 * Renders a circular progress bar with percentage display.
 *
 * @param {object} props - Component props.
 * @param {number} props.percentage - The current progress percentage (0-100).
 * @param {number} [props.size=48] - The width and height of the circular progress bar in pixels.
 * @param {number} [props.strokeWidth=4] - The thickness of the progress stroke.
 * @param {string} [props.circleColor="rgba(255, 255, 255, 0.3)"] - Color of the background circle.
 * @param {string} [props.progressColor="#3b82f6"] - Color of the progress arc (Tailwind blue-500).
 * @param {string} [props.textColor="#ffffff"] - Color of the percentage text.
 */
const CircularProgressBar = ({
  percentage,
  size = 35,
  strokeWidth = 4,
  circleColor = "rgba(255, 255, 255, 0.3)", // Light transparent white for glassmorphism
  progressColor = "#3b82f6", // Tailwind blue-500
  textColor = "#000", // White text for contrast
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        className="transform -rotate-90" // Rotate to start progress from the top
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Circle */}
        <circle
          stroke={circleColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          className="stroke-primary/20"
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Arc */}
        <circle
          stroke={progressColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round" // Makes the end of the progress arc rounded
          className="transition-all duration-500 ease-in-out" // Smooth transition for progress changes
        />
      </svg>
      {/* Percentage Text */}
      <span
        className="absolute text-sm font-bold text-center"
        style={{ color: textColor }}
      >
        {Math.round(percentage)}
      </span>
    </div>
  );
};

export default CircularProgressBar;
