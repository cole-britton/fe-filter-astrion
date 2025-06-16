import { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import "./App.css";
import CustomPaginationActionsTable from "./components/DataTableBase/DataTableBase";
import MultipleSelect from "./components/MultiSelect/MultiSelect";
import HeaderBar from "./components/HeaderBar/HeaderBar";

function App() {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableRows, setTableRows] = useState<any[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [numberOptions, setNumberOptions] = useState<string[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<Array<string | number>>([]);

  const handleSelectedNumbersChange = (newSelectedValues: Array<string | number>) => {
    setSelectedNumbers(newSelectedValues);
  };

  useEffect(() => {
    setLoading(true);
    fetch("data/dataset_large.csv")
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
              const rowsData = results.data.slice(1) as any[][];
              // Filter out any potentially empty trailing rows from parsing
              const nonEmptyRows = rowsData.filter((row) =>
                row.some(
                  (cell) => cell !== null && cell !== undefined && cell !== ""
                )
              );
              setTableHeaders(headers);
              setTableRows(nonEmptyRows);

              let numberColIndex = headers.findIndex(
                (h) => h.toLowerCase() === "number"
              );
              if (numberColIndex === -1) {
                numberColIndex = headers.findIndex(
                  (h) => h.toLowerCase() === "numbers"
                );
              }

              if (numberColIndex !== -1) {
                const allNumberValues = nonEmptyRows
                  .map((row) => row[numberColIndex])
                  .filter(
                    (value) =>
                      value !== null && value !== undefined && value !== ""
                  );

                const uniqueNumberValues = Array.from(
                  new Set(allNumberValues.map(String))
                );
                setNumberOptions(uniqueNumberValues);
              } else {
                console.error(
                  "Column 'number' or 'numbers' not found in CSV headers."
                );
                setNumberOptions([]);
              }
            } else {
              console.error("Parsed CSV data is empty or invalid.");
              setNumberOptions([]);
            }
            setLoading(false);
          },
          error: (error: any) => {
            console.error("Error parsing CSV:", error);
            setLoading(false);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching CSV:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading data...</div>;
  }

  const numberColumnIndex = useMemo(() => {
    let idx = tableHeaders.findIndex((h) => h.toLowerCase() === "number");
    if (idx === -1) {
      idx = tableHeaders.findIndex((h) => h.toLowerCase() === "numbers");
    }
    return idx;
  }, [tableHeaders]);

  const filteredTableRows = useMemo(() => {
    if (selectedNumbers.length === 0) {
      return tableRows;
    }
    if (numberColumnIndex === -1) {
      console.warn("Number column not found, returning all rows.");
      return tableRows;
    }
    return tableRows.filter((row) => {
      const cellValue = row[numberColumnIndex];
      // Ensure selectedNumbers are strings for comparison, as numberOptions are strings
      const selectedNumbersAsStrings = selectedNumbers.map(String);
      return selectedNumbersAsStrings.includes(String(cellValue));
    });
  }, [tableRows, selectedNumbers, numberColumnIndex]);

  return (
    <div className="main-container">
      <HeaderBar
        logoSrc="src/astr.png"
        logoAlt="astrion logo"
        fullName="Cole Britton"
        email="cbritton@gmail.com"
      />
      <div className="dropdown-container">
        <MultipleSelect
          label="Number"
          options={numberOptions}
          selectedValues={selectedNumbers}
          onChange={handleSelectedNumbersChange}
        />
        <MultipleSelect label="Mod3" options={numberOptions} />
        <MultipleSelect label="Mod4" options={numberOptions} />
        <MultipleSelect label="Mod5" options={numberOptions} />
        <MultipleSelect label="Mod6" options={numberOptions} />
      </div>
      <CustomPaginationActionsTable
        headers={tableHeaders}
        rows={filteredTableRows} // Use filtered rows
        rowsPerPageProp={100}
      />
    </div>
  );
}

export default App;
