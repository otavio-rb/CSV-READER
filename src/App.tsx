import { ColumnSelector } from "./components/ColumnSelector";
import { useFileUpload } from "./hooks/useFileUpload";
import { FileUpload } from "./components/FileUpload";
import React, { useEffect, useState } from "react";
import { useToast } from "react-toastify";

function App() {
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);


  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleFileUpload = (uploadedColumns: string[], uploadedData: any[]) => {
    setData(uploadedData);
    setIsFileUploaded(true);
  };

  const handleDownloadCSV = () => {
    const filteredData = data.map((row) => {
      const filteredRow: Record<string, any> = {};
      selectedColumns.forEach((column) => {
        filteredRow[column] = row[column];
      });
      return filteredRow;
    });

    const csvRows = [selectedColumns];

    filteredData.forEach((row) => {
      const values = selectedColumns.map((column) => row[column]);
      csvRows.push(values);
    });

    console.log(filteredData, data);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.join(",")).join("\n");

    console.log("Filtered Data:", filteredData);
    console.log("CSV Content:", csvContent);

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "selected_columns.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendToSupabase = async () => {
    const selectedData = columns.filter((column) =>
      selectedColumns.includes(column)
    );
    const jsonData = JSON.stringify(selectedData);
    try {
      const response = await fetch(
        "https://your-supabase-url.supabase.co/rest/v1/your-table",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: "your-supabase-api-key",
            Authorization: "Bearer your-supabase-api-key",
          },
          body: jsonData,
        }
      );
      if (!response.ok) throw new Error("Erro ao enviar dados para o Supabase");
      alert("Dados enviados com sucesso!");
    } catch (error) {
      console.error("Erro:", error);
      alert("Falha ao enviar dados para o Supabase");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center p-4">
        {/* <div className="text-2xl font-semibold text-blue-500">UPLOAD-TOOLS</div> */}
      </div>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Carregamento de Arquivo
            </h1>
            <p className="text-gray-600">
              Faça o upload do seu arquivo CSV e selecione as colunas que deseja
              incluir
            </p>
          </div>

          <FileUpload
            onUpload={handleFileUpload}
            setColumns={setColumns}
            setData={setData}
          />

          {columns.length > 0 && (
            <div className="flex flex-col space-y-4">
              <ColumnSelector
                columns={columns}
                selectedColumns={selectedColumns}
                onColumnToggle={handleColumnToggle}
              />

              <div className="flex space-x-4">
                <button
                  onClick={handleDownloadCSV}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Baixar CSV
                </button>
                {/* <button
                  onClick={handleSendToSupabase}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Enviar para o banco de dados
                </button> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
