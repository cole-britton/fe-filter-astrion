import * as React from "react";
import { Theme, useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface MultipleSelectProps {
  label: string;
  options: string[] | number[];
}

function getStyles(
  option: string | number,
  selectedValues: readonly (string | number)[],
  theme: Theme
) {
  return {
    fontWeight: selectedValues.includes(option)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function MultipleSelect({
  label,
  options = [],
}: MultipleSelectProps) {
  const theme = useTheme();
  const [selectedValues, setSelectedValues] = React.useState<
    Array<string | number>
  >([]);

  const handleChange = (event: SelectChangeEvent<typeof selectedValues>) => {
    const {
      target: { value },
    } = event;
    setSelectedValues(typeof value === "string" ? value.split(",") : value);
  };

  const selectId = `${label.toLowerCase().replace(/\s+/g, "-")}-select`;
  const labelId = `${label.toLowerCase().replace(/\s+/g, "-")}-label`;

  return (
    <div>
      <FormControl sx={{ m: 1, width: 200, margin: 0 }}>
        <InputLabel id={labelId}>{label}</InputLabel>
        <Select
          labelId={labelId}
          id={selectId}
          multiple
          value={selectedValues}
          onChange={handleChange}
          input={<OutlinedInput label={label} />}
          MenuProps={MenuProps}
        >
          {options.map((option) => (
            <MenuItem
              key={option}
              value={option}
              style={getStyles(option, selectedValues, theme)}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
