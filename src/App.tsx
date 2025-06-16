import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./App.css";
import CustomPaginationActionsTable from "./components/DataTableBase/DataTableBase";
import HeaderBar from "./components/HeaderBar/HeaderBar";
import AutocompleteBase from "./components/AutoComplete/AutoComplete";
import AutocompleteBigList from "./components/AutoCompleteBigList/AutoCompleteBigList";

interface filterObject {
  title: string;
  options: string[];
}

function App() {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableRows, setTableRows] = useState<any[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterOptions, setFilterOptions] = useState<filterObject[]>([]);

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
              const rowsData = results.data.slice(1) as any[][];

              setTableHeaders(headers);
              setTableRows(rowsData);

              const allFilterOptions: filterObject[] = [];

              for (
                let columnIndex = 0;
                columnIndex < headers.length;
                columnIndex++
              ) {
                const columnValues = rowsData
                  .map((row) => row[columnIndex])
                  .filter(
                    (value) =>
                      value !== null && value !== undefined && value !== ""
                  );

                const uniqueValues = Array.from(
                  new Set(columnValues.map(String))
                );

                allFilterOptions.push({
                  title: headers[columnIndex],
                  options: uniqueValues,
                });
              }

              setFilterOptions(allFilterOptions);
            } else {
              console.error("Parsed CSV data is empty or invalid.");
              setFilterOptions([]);
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

  return (
    <div className="main-container">
      <HeaderBar
        logoSrc="src/astr.png"
        logoAlt="astrion logo"
        fullName="Cole Britton"
        email="cbritton@gmail.com"
      />
      <div className="dropdown-container">
        <AutocompleteBigList
          options={filterOptions[0]?.options || []}
          label={filterOptions[0]?.title || ""}
        />
        {filterOptions.slice(1, 5).map((filter, idx) => (
          <AutocompleteBase
            key={idx}
            options={
              idx === 0 ? filter.options.slice(0, 10) : filter.options || []
            }
            label={filter.title || ""}
          />
        ))}
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
