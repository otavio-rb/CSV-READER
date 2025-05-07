import { useState, DragEvent, ChangeEvent } from "react";
import { parseCSV } from "../utils/csvParser";
import { convertToCSV } from "../utils/spreadsheetConverter";

interface CSVData {
  headers: string[];
  data: any[];
}

export function useFileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const acceptedFileTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/vnd.ms-excel", // xls
    "application/vnd.oasis.opendocument.spreadsheet", // ods,
    "application/pdf",
  ];

  const isValidFileType = (file: File): boolean => {
    return acceptedFileTypes.includes(file.type);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && isValidFileType(file)) {
      try {
        let csvContent: string;
        if (file.type === "text/csv") {
          csvContent = await file.text();
        } else {
          csvContent = await convertToCSV(file);
        }

        const { headers, data } = parseCSV(csvContent);
        setColumns(headers);
        setSelectedColumns(headers);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleFileInput = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<CSVData | null> => {
    const file = e.target.files?.[0];
    console.log(file?.type);
    if (file && isValidFileType(file)) {
      try {
        let csvContent: string;
        switch (file.type) {
          case "text/csv":
            csvContent = await file.text();
            break;
          case "application/pdf":
            alert("PDF not supported");
            break;
          default:
            csvContent = await convertToCSV(file);
            break;
        }
        
        if (file.type === "text/csv") {
          csvContent = await file.text();
        } else {
          csvContent = await convertToCSV(file);
        }

        const { headers, data } = parseCSV(csvContent);
        setColumns(headers);
        setSelectedColumns(headers);
        return { headers, data };
      } catch (error) {
        console.error("Error processing file:", error);
        return null;
      }
    }
    return null;
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(column)) {
        return prev.filter((col) => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  return {
    isDragging,
    handleDrop,
    handleDragOver,
    handleFileInput,
    columns,
    selectedColumns,
    toggleColumn,
    setColumns,
    setSelectedColumns,
  };
}
