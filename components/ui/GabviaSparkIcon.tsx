import React from "react";

export interface GabviaSparkIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  className?: string;
}

/**
 * Custom Gabvia brand icon inspired by the Gabvia logo:
 * Speech-bubble ring with the inner 'G' and sweeping horizon bridge arc.
 */
export function GabviaSparkIcon({
  size = 16,
  color,
  className,
  ...rest
}: GabviaSparkIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient
          id="gabviaWebBrandGrad"
          x1="2"
          y1="20"
          x2="22"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={color || "#0066FF"} />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
      </defs>

      {/* Outer Speech Bubble Ring with bottom-left tail */}
      <path
        d="M4.2 11.4A8.2 8.2 0 1 1 19.9 11.1M19.3 14.6A8.2 8.2 0 0 1 9.3 19.2L5.4 20.9L6.6 17.2A8.1 8.1 0 0 1 4.6 14.4"
        stroke="url(#gabviaWebBrandGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner 'G' curve */}
      <path
        d="M14.9 8.7A3.9 3.9 0 1 0 15.2 13.6V11.8"
        stroke="url(#gabviaWebBrandGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sweeping Horizon Bridge Arc across the G */}
      <path
        d="M1.6 14.3C6.8 10.6 16.5 10.4 22.4 14.3C16.8 11.9 7.2 12.0 1.6 14.3Z"
        fill="url(#gabviaWebBrandGrad)"
        stroke="url(#gabviaWebBrandGrad)"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { GabviaSparkIcon as Sparkles };
export default GabviaSparkIcon;
