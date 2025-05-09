
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Clock } from "lucide-react";

type TimeSlot = {
  id: string;
  start_time: string;
  end_time: string;
};

interface TimeSlotCardProps {
  dayName: string;
  slots: TimeSlot[];
  onDelete: (slotId: string) => void;
}

const TimeSlotCard = ({ dayName, slots, onDelete }: TimeSlotCardProps) => {
  // Format time (HH:MM)
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{dayName}</CardTitle>
      </CardHeader>
      <CardContent>
        {!slots || slots.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>Fechado</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {slots.map((slot) => (
              <li key={slot.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50">
                <span>
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(slot.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlotCard;
