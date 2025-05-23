
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, PlusCircle } from "lucide-react";

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClient: () => void;
  buttonLabel?: string;
  placeholder?: string;
  showAddButton?: boolean;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onAddClient,
  buttonLabel = "Novo Cliente",
  placeholder = "Buscar clientes",
  showAddButton = true
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex-1 min-w-[200px] relative">
            <Input
              type="search"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
          {showAddButton && (
            <Button onClick={onAddClient}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {buttonLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
