import { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import "./App.css";
import CustomPaginationActionsTable from "./components/DataTableBase/DataTableBase";
import HeaderBar from "./components/HeaderBar/HeaderBar";
import AutocompleteBigList from "./components/AutoCompleteBigList/AutoCompleteBigList";
import DataSizeToggle from "./components/DataSizeToggle/DataSizeToggle";

interface filterObject {
  title: string;
  options: string[];
}

function App() {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableRows, setTableRows] = useState<any[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [baseFilterOptions, setBaseFilterOptions] = useState<filterObject[]>(
    []
  );
  const [selectedFilters, setSelectedFilters] = useState<{
    [columnIndex: number]: string[];
  }>({});
  const [datasetSize, setDatasetSize] = useState<string>("small");

  const filteredTableRows = useMemo(() => {
    if (Object.keys(selectedFilters).length === 0) {
      return tableRows;
    }
    return tableRows.filter((row) => {
      return Object.entries(selectedFilters).every(
        ([columnIndexStr, filterValues]) => {
          const columnIndex = parseInt(columnIndexStr, 10);
          if (filterValues.length === 0) {
            return true;
          }
          return filterValues.includes(row[columnIndex]);
        }
      );
    });
  }, [tableRows, selectedFilters]);

  const dynamicFilterOptions = useMemo(() => {
    if (baseFilterOptions.length === 0) return [];

    const newOptions: filterObject[] = [];

    newOptions.push({
      title: baseFilterOptions[0].title,
      options: baseFilterOptions[0].options,
    });

    for (
      let filterIndex = 1;
      filterIndex < baseFilterOptions.length;
      filterIndex++
    ) {
      const rowsMatchingPreviousFilters = tableRows.filter((row) => {
        for (
          let prevFilterIndex = 0;
          prevFilterIndex < filterIndex;
          prevFilterIndex++
        ) {
          const selections = selectedFilters[prevFilterIndex];
          if (selections && selections.length > 0) {
            if (!selections.includes(row[prevFilterIndex])) {
              return false;
            }
          }
        }
        return true;
      });

      const uniqueValues = Array.from(
        new Set(
          rowsMatchingPreviousFilters
            .map((row) => row[filterIndex])
            .filter(
              (value) => value !== null && value !== undefined && value !== ""
            )
            .map(String)
        )
      );

      newOptions.push({
        title: baseFilterOptions[filterIndex].title,
        options: uniqueValues,
      });
    }

    return newOptions;
  }, [baseFilterOptions, selectedFilters, tableRows]);

  const handleFilterChange = (columnIndex: number, value: string[]) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      newFilters[columnIndex] = value;

      for (let i = columnIndex + 1; i < baseFilterOptions.length; i++) {
        delete newFilters[i];
      }

      return newFilters;
    });
  };

  const handleDatasetToggleChange = (value: string) => {
    setDatasetSize(value);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/data/dataset_${datasetSize}.csv`)
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

              setBaseFilterOptions(allFilterOptions);
            } else {
              console.error("Parsed CSV data is empty or invalid.");
              setBaseFilterOptions([]);
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
  }, [datasetSize]);

  if (loading) {
    return <div className="loading-container">Loading data...</div>;
  }

  return (
    <div className="main-container">
      <HeaderBar
        logoSrc="/astr.png"
        logoAlt="astrion logo"
        fullName="Cole Britton"
        email="cbritton@gmail.com"
      />
      <div className="toggle-container">
        <DataSizeToggle
          value={datasetSize}
          onChange={(_event, value) => handleDatasetToggleChange(value)}
        />
      </div>
      <div className="dropdown-container">
        {dynamicFilterOptions.map((filter, idx) => (
          <AutocompleteBigList
            key={idx}
            options={filter.options || []}
            label={filter.title || ""}
            value={selectedFilters[idx] || []}
            onChange={(_event, value) => handleFilterChange(idx, value)}
          />
        ))}
      </div>
      <CustomPaginationActionsTable
        headers={tableHeaders}
        rows={filteredTableRows}
        rowsPerPageProp={100}
      />
    </div>
  );
}

export default App;
