import type { CSSProperties } from "react";
export type IconName =
  | "layers"
  | "code"
  | "award"
  | "briefcase"
  | "stack"
  | "arrow"
  | "external"
  | "github"
  | "close"
  | "image"
  | "file"
  | "check"
  | "spark"
  | "expand";
interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}
const paths: Record<IconName, string[]> = {
  layers: ["m12 3 10 5-10 5L2 8l10-5Z", "m2 12 10 5 10-5", "m2 16 10 5 10-5"],
  code: ["m8 7-5 5 5 5", "m16 7 5 5-5 5", "m14 4-4 16"],
  award: [
    "M16 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    "m8 13-2 8 6-3 6 3-2-8",
    "M12 1v2",
    "m4 4 2 1",
    "m18 5 2-1",
  ],
  briefcase: [
    "M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2",
    "M4 6h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
    "M3 11c5 4 13 4 18 0",
    "M12 11v4",
  ],
  stack: ["m12 3 9 5-9 5-9-5 9-5Z", "m3 12 9 5 9-5", "m3 16 9 5 9-5"],
  arrow: ["M5 12h14", "m13 6 6 6-6 6"],
  external: [
    "M14 3h7v7",
    "m21 3-11 11",
    "M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5",
  ],
  github: [
    "M9 19c-4.3 1.3-4.3-2.2-6-2.7",
    "M15 22v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.2-1.5 6.2-6.8A5.2 5.2 0 0 0 19 5a4.8 4.8 0 0 0-.1-3.6S17.7 1 15 2.8a13.4 13.4 0 0 0-7 0C5.3 1 4.1 1.4 4.1 1.4A4.8 4.8 0 0 0 4 5a5.2 5.2 0 0 0-1.4 3.6c0 5.3 3.2 6.5 6.2 6.8a3.4 3.4 0 0 0-.8 2.7V22",
  ],
  close: ["m6 6 12 12", "M18 6 6 18"],
  image: ["M4 3h16v18H4z", "m4 16 5-5 4 4 3-3 4 4", "M10 7h.01"],
  file: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z",
    "M14 2v6h6",
    "M8 13h8",
    "M8 17h6",
  ],
  check: ["m5 12 4 4L19 6"],
  spark: ["m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z"],
  expand: ["M8 3H3v5", "m3 3 6 6", "M16 21h5v-5", "m21 21-6-6"],
};
export default function Icon({
  name,
  size = 20,
  className = "",
  style,
}: IconProps) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name].map((d, i) => (
        <path d={d} key={i} />
      ))}
    </svg>
  );
}
