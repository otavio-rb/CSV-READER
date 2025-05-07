import React from 'react';
import { Check } from 'lucide-react';

interface ColumnSelectorProps {
  columns: string[];
  selectedColumns: string[];
  onColumnToggle: (column: string) => void;
}

export function ColumnSelector({ columns, selectedColumns, onColumnToggle }: ColumnSelectorProps) {
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Selecione as colunas para incluir no CSV</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {columns.map((column, idx) => (
          <label
            key={`column-${idx}`}
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
            onClick={() => onColumnToggle(column)}
          >
            <div
              className={`w-5 h-5 border rounded flex items-center justify-center ${
                selectedColumns.includes(column)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}
            >
              {selectedColumns.includes(column) && (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">{column}</span>
          </label>
        ))}
      </div>
    </div>
  );
}