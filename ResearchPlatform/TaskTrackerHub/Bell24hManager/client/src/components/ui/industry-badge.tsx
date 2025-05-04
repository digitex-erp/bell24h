import { cn } from "@/lib/utils";

interface IndustryBadgeProps {
  industry: string;
  className?: string;
}

export function IndustryBadge({ industry, className }: IndustryBadgeProps) {
  const getIndustryColor = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'manufacturing':
        return 'bg-primary-light/10 text-primary-dark';
      case 'electronics':
        return 'bg-indigo-100 text-indigo-800';
      case 'chemicals':
        return 'bg-yellow-100 text-yellow-800';
      case 'automotive':
        return 'bg-red-100 text-red-800';
      case 'textiles':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formattedIndustry = industry.charAt(0).toUpperCase() + industry.slice(1);

  return (
    <span className={cn(
      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
      getIndustryColor(industry),
      className
    )}>
      {formattedIndustry}
    </span>
  );
}
