import "./App.css";
import CustomPaginationActionsTable from "./components/DataTableBase/DataTableBase";
import HeaderBar from "./components/HeaderBar/HeaderBar";
import MultipleSelectChip from "./components/MultiSelect/MultiSelect";

function App() {
  return (
    <div className="main-container">
      <HeaderBar
        logoSrc="src/astr.png"
        logoAlt="astrion logo"
        fullName="Cole Britton"
        email="cbritton@gmail.com"
      />
      <div className="dropdown-container">
        <MultipleSelectChip />
        <MultipleSelectChip />
        <MultipleSelectChip />
        <MultipleSelectChip />
      </div>
      <CustomPaginationActionsTable />
    </div>
  );
}

export default App;
