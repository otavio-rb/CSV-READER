import React from "react";
import { Upload } from "lucide-react";
import { useFileUpload } from "../hooks/useFileUpload";
import { parseCSV } from "../utils/csvParser";
import { convertToCSV } from "../utils/spreadsheetConverter";
import { toast } from "react-toastify";

interface FileUploadProps {
  onUpload: (columns: string[], data: any[]) => void;
  setData: (data: any[]) => void;
  setColumns: (columns: string[]) => void;
}

export function FileUpload({ onUpload, setColumns, setData }: FileUploadProps) {
  const {
    handleDrop,
    handleDragOver,
    handleFileInput: originalHandleFileInput,
    isDragging,
  } = useFileUpload();

  const handlePdfUpload = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3000/extract-table", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Falha ao extrair tabelas do PDF.");
      }

      if (result.data && result.data.length > 0) {
        const firstTable = result.data[0];
        const columns = Object.keys(firstTable[0]);
        setColumns(columns);
        setData(firstTable);
        onUpload(columns, firstTable);
        return firstTable;
      } else {
        throw new Error("Nenhuma tabela encontrada no PDF.");
      }
    } catch (error) {
      console.error("Erro ao fazer upload do PDF:", error);
      toast.error(`Erro ao processar PDF: ${(error as Error).message}`);
      throw error;
    }
  };

  const handleFileInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        let csvContent: string | JSON = "";

        switch (file.type) {
          case "text/csv":
            csvContent = await file.text();
            break;
          case "application/pdf":
            csvContent = await handlePdfUpload(file);
            break;
          default:
            csvContent = await convertToCSV(file);
            break;
        }

        const { headers, data } = parseCSV(csvContent);
        if (headers.length > 0) {
          setColumns(headers);
          setData(data);
          onUpload(headers, data);
        }
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        toast.error(`Erro ao processar arquivo: ${(error as Error).message}`);
      }
    } else {
      toast.error("Nenhum arquivo selecionado.");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div
        className={`w-full p-8 border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <p className="text-lg font-medium text-gray-600">
            Arraste e solte um arquivo aqui, ou{" "}
            <label className="text-blue-500 cursor-pointer hover:text-blue-600">
              busque no dispositivo
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls,.ods,.pdf"
                onChange={handleFileInput}
              />
            </label>
          </p>
          <p className="text-sm text-gray-500">
            Formatos suportados: CSV, XLSX, XLS, ODS, PDF
          </p>
        </div>
      </div>
    </div>
  );
}