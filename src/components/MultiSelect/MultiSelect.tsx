import * as React from "react";
import { Theme, useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import ListSubheader from '@mui/material/ListSubheader';
import ListItemIcon from '@mui/material/ListItemIcon'; // For potential icons
import Checkbox from '@mui/material/Checkbox'; // For multi-select checkboxes

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
// Adjusted MenuProps - maxHeight might need to be dynamic or larger
// if the search field is inside the dropdown.
const MENU_LIST_HEIGHT = ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP;
const SEARCH_FIELD_HEIGHT = 50; // Approximate height for the search field

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: MENU_LIST_HEIGHT + SEARCH_FIELD_HEIGHT,
      width: 250,
    },
  },
  //variant: "menu" as "menu", // Important for allowing children like FixedSizeList
  // getContentAnchorEl: null, // May be needed for positioning
};

interface MultipleSelectProps {
  label: string;
  options: string[] | number[];
  selectedValues: readonly (string | number)[];
  onChange: (newSelectedValues: Array<string | number>) => void;
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
  selectedValues, // Use prop
  onChange,     // Use prop
}: MultipleSelectProps) {
  const theme = useTheme();
  // Removed local selectedValues state
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredOptions = options.filter((option) =>
    String(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (event: SelectChangeEvent<typeof selectedValues>) => {
    const {
      target: { value },
    } = event;
    // Call the onChange prop instead of setting local state
    onChange(typeof value === "string" ? value.split(",") : value);
  };

  const selectId = `${label.toLowerCase().replace(/\s+/g, "-")}-select`;
  const labelId = `${label.toLowerCase().replace(/\s+/g, "-")}-select`;

  // The Row component for FixedSizeList
  const Row = React.forwardRef<HTMLLIElement, ListChildComponentProps>(
    (props, ref) => {
      const { index, style } = props;
      const option = filteredOptions[index];
      const isSelected = selectedValues.includes(option);

      return (
        <MenuItem
          ref={ref}
          key={option}
          value={option} // Important for Select to recognize the value
          style={{ ...style, ...getStyles(option, selectedValues, theme) }}
          // onClick is handled by Select's onChange when MenuItem is clicked
        >
          <Checkbox checked={isSelected} />
          {option}
        </MenuItem>
      );
    }
  );

  return (
    <div>
      <FormControl sx={{ m: 1, width: 200, margin: 0 }}>
        <InputLabel id={labelId}>{label}</InputLabel>
        <Select
          labelId={labelId}
          id={selectId}
          multiple
          value={selectedValues}
          onChange={handleChange} // This will be called when a MenuItem from FixedSizeList is clicked
          input={<OutlinedInput label={label} />}
          MenuProps={MenuProps}
          // renderValue={(selected) => (selected as Array<string|number>).join(', ')} // Customize how selected values are displayed
        >
          {/* 1. Search TextField as a non-selectable item */}
          <ListSubheader sx={{padding: 0, backgroundColor: 'background.paper', // ensure it stays on top
             // We need to stop propagation here to prevent the menu from closing
             // when the text field is clicked.
          }}>
            <TextField
              size="small"
              autoFocus
              placeholder="Search..."
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
              // Prevent menu from closing when clicking on the TextField
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              sx={{ padding: "8px"}}
              // InputProps={{
              //   startAdornment: (
              //     <ListItemIcon>
              //       <SearchIcon />
              //     </ListItemIcon>
              //   ),
              // }}
            />
          </ListSubheader>

          {/* 2. Virtualized List of Options */}
          {/* FixedSizeList needs to be a direct child for Select to manage it,
              or its items need to be. Since FixedSizeList creates items,
              this structure is how react-window is typically integrated.
              The key is that the items rendered by FixedSizeList are MenuItems.
          */}
          <FixedSizeList
            height={MENU_LIST_HEIGHT} // Height for the list itself
            itemCount={filteredOptions.length}
            itemSize={ITEM_HEIGHT}
            width="100%" // Takes the width of the Paper from MenuProps
            itemData={filteredOptions} // Pass filtered options to Row component if needed, though Row closes over it
            // Pass `Row` as a direct child to `FixedSizeList`
          >
            {Row}
          </FixedSizeList>
        </Select>
      </FormControl>
    </div>
  );
}
