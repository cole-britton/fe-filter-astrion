import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

interface DataSizeToggleProps {
  value: string;
  onChange: (event: React.SyntheticEvent, value: string) => void;
}

export default function DataSizeToggle({
  value,
  onChange,
}: DataSizeToggleProps) {
  return (
    <ToggleButtonGroup
      color="primary"
      value={value}
      exclusive
      onChange={onChange}
      aria-label="Dataset"
    >
      <ToggleButton value="small">Small Dataset</ToggleButton>
      <ToggleButton value="large">Large Dataset</ToggleButton>
    </ToggleButtonGroup>
  );
}
