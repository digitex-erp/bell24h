import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  calendarIcon?: React.ReactNode;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  calendarIcon,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayText = useMemo(() => {
    if (value?.from && value?.to) {
      return `${format(value.from, 'PP')} - ${format(value.to, 'PP')}`;
    }
    if (value?.from) {
      return `${format(value.from, 'PP')} - Select end date`;
    }
    return 'Select date range';
  }, [value]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            {calendarIcon || <CalendarIcon className="mr-2 h-4 w-4" />}
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={(selectedRange) => {
              onChange(selectedRange || { from: undefined, to: undefined });
              if (selectedRange?.from && selectedRange?.to) {
                setIsOpen(false); // Close after selection is complete
              }
            }}
            numberOfMonths={2}
            disabled={{ after: new Date() }} // No future dates
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}