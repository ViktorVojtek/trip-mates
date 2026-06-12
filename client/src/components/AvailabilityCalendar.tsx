import { useState } from 'react';

interface AvailabilityCalendarProps {
  value?: string[];
  onChange?: (dates: string[]) => void;
  readOnly?: boolean;
}

export default function AvailabilityCalendar({
  value = [],
  onChange,
  readOnly = false,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<Set<string>>(new Set(value));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const today = new Date().toISOString().split('T')[0];

  const toggleDate = (dateStr: string) => {
    if (readOnly) return;
    const next = new Set(selected);
    if (next.has(dateStr)) {
      next.delete(dateStr);
    } else {
      next.add(dateStr);
    }
    setSelected(next);
    onChange?.([...next].sort());
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const cells: Array<{ d: number; dateStr: string } | null> = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return { d, dateStr: `${year}-${mm}-${dd}` };
    }),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
        >
          ‹
        </button>
        <h3 className="text-sm font-semibold text-gray-700">{monthName}</h3>
        <button
          type="button"
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1" role="columnheader">
            {d}
          </div>
        ))}
        {cells.map((cell, i) =>
          cell ? (
            <button
              key={i}
              type="button"
              onClick={() => toggleDate(cell.dateStr)}
              disabled={readOnly}
              className={`aspect-square w-full rounded-full text-xs font-medium transition ${
                selected.has(cell.dateStr)
                  ? 'bg-blue-600 text-white'
                  : cell.dateStr === today
                    ? 'border border-blue-400 text-blue-600 hover:bg-blue-50'
                    : 'text-gray-700 hover:bg-blue-50'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {cell.d}
            </button>
          ) : (
            <div key={i} />
          ),
        )}
      </div>

      {!readOnly && selected.size > 0 && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          {selected.size} day{selected.size !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
