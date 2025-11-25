
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 px-4">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          onClick={() => onCategoryChange(category)}
          className={`
            relative overflow-hidden transition-all duration-300 ease-out
            text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2.5 h-auto
            border-2 font-medium rounded-lg
            transform hover:scale-105 active:scale-95
            ${
              activeCategory === category
                ? "bg-[#5865f2] border-[#5865f2] text-white shadow-lg shadow-[#5865f2]/25 hover:bg-[#4752c4] hover:border-[#4752c4] hover:shadow-[#4752c4]/30"
                : "bg-[#2f3136] border-[#40444b] text-[#b9bbbe] hover:bg-[#36393f] hover:border-[#5865f2] hover:text-white hover:shadow-md"
            }
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
            before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
          `}
        >
          <span className="relative z-10">{category}</span>
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
