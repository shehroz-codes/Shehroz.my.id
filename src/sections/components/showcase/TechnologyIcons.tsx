import { technologies } from "./portfolioData";
interface TechnologyIconsProps {
  ids: string[];
}
export default function TechnologyIcons({ ids }: TechnologyIconsProps) {
  const items = technologies.filter((t) => ids.includes(t.id));
  if (!items.length)
    return <span className="ps-stack-pending">Technology details pending</span>;
  return (
    <ul className="ps-tech-icons" aria-label="Project technologies">
      {items.map((t) => (
        <li key={t.id}>
          <img
            src={t.icon}
            alt={t.name}
            width="24"
            height="24"
            title={t.name}
            loading="lazy"
          />
        </li>
      ))}
    </ul>
  );
}
