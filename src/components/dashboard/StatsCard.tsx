
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

const StatsCard = ({ title, value, icon: Icon, description }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Icon className="h-8 w-8 text-primary mr-3" />
          <div className="text-2xl font-bold">{value}</div>
        </div>
        {description && (
          <p className="text-sm text-gray-500 mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
