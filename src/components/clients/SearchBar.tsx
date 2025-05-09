
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, PlusCircle } from "lucide-react";

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClient: () => void;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onAddClient
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex-1 min-w-[200px] relative">
            <Input
              type="search"
              placeholder="Buscar clientes"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
          <Button onClick={onAddClient}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
