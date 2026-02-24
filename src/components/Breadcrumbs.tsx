import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Home className="w-4 h-4" />
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          {item.onClick ? (
            <button onClick={item.onClick} className="hover:text-primary transition-colors">
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
