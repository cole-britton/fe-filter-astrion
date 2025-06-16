import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./App.css";
import CustomPaginationActionsTable from "./components/DataTableBase/DataTableBase";
import MultipleSelect from "./components/MultiSelect/MultiSelect";
import HeaderBar from "./components/HeaderBar/HeaderBar";

function App() {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableRows, setTableRows] = useState<any[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch("data/dataset_small.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((csvText) => {
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              const headers = results.data[0] as string[];
              const rows = results.data.slice(1) as any[][];
              // Filter out any potentially empty trailing rows from parsing
              const nonEmptyRows = rows.filter((row) =>
                row.some(
                  (cell) => cell !== null && cell !== undefined && cell !== ""
                )
              );
              setTableHeaders(headers);
              setTableRows(nonEmptyRows);
            } else {
              console.error("Parsed CSV data is empty or invalid.");
              // Optionally set an error state here
            }
            setLoading(false);
          },
          error: (error: any) => {
            console.error("Error parsing CSV:", error);
            setLoading(false);
            // Optionally set an error state here
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching CSV:", error);
        setLoading(false);
        // Optionally set an error state here (e.g., setTableError("Failed to load data"))
      });
  }, []);

  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="main-container">
      <HeaderBar
        logoSrc="src/astr.png"
        logoAlt="astrion logo"
        fullName="Cole Britton"
        email="cbritton@gmail.com"
      />
      <div className="dropdown-container">
        <MultipleSelect />
        <MultipleSelect />
        <MultipleSelect />
        <MultipleSelect />
      </div>
      <CustomPaginationActionsTable
        headers={tableHeaders}
        rows={tableRows}
        rowsPerPageProp={100}
      />
    </div>
  );
}

export default App;
