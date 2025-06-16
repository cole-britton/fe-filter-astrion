import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultipleSelect from './MultiSelect';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Needed for MUI components

// Mock options for the select component
const mockOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
const mockOnChange = vi.fn();
const theme = createTheme(); // Create a default theme

// Helper function to render the component with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('MultipleSelect Search Functionality', () => {
  it('filters options based on search term', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <MultipleSelect
        label="Fruits"
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Open the dropdown
    const selectButton = screen.getByRole('button', { name: /fruits/i });
    await user.click(selectButton);

    // Type in the search field
    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'Apple');

    // Check that 'Apple' is visible
    expect(screen.getByText('Apple')).toBeInTheDocument();

    // Check that other options not matching 'Apple' are not visible
    // Note: 'Date' and 'Elderberry' should not be rendered by FixedSizeList if not visible
    // We query the listbox directly for its items.
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).queryByText('Banana')).not.toBeInTheDocument();
    expect(within(listbox).queryByText('Cherry')).not.toBeInTheDocument();
    // For FixedSizeList, items not in view might not be in the document at all.
    // This test assumes that if it's not found by text, it's not visible/rendered in the current view.
  });

  it('performs case-insensitive search', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <MultipleSelect
        label="Fruits"
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Open the dropdown
    const selectButton = screen.getByRole('button', { name: /fruits/i });
    await user.click(selectButton);

    // Type in the search field in lowercase
    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'cherry');

    // Check that 'Cherry' is visible (note the case difference)
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('Cherry')).toBeInTheDocument();

    // Check that other options are not visible
    expect(within(listbox).queryByText('Apple')).not.toBeInTheDocument();
    expect(within(listbox).queryByText('Banana')).not.toBeInTheDocument();
  });

  it('shows all options when search term is cleared', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <MultipleSelect
        label="Fruits"
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Open the dropdown
    const selectButton = screen.getByRole('button', { name: /fruits/i });
    await user.click(selectButton);

    const searchInput = screen.getByPlaceholderText('Search...');
    // Type a search term
    await user.type(searchInput, 'Apple');

    // Verify that only 'Apple' is shown
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('Apple')).toBeInTheDocument();
    expect(within(listbox).queryByText('Banana')).not.toBeInTheDocument();

    // Clear the search input
    await user.clear(searchInput);

    // Verify that all original options are shown again
    // Due to virtualization, we check for a few specific options that should now be back.
    // FixedSizeList might not render all 500 if they don't fit, so we check a subset.
    expect(within(listbox).getByText('Apple')).toBeInTheDocument();
    expect(within(listbox).getByText('Banana')).toBeInTheDocument();
    expect(within(listbox).getByText('Cherry')).toBeInTheDocument();
    // For a very long list, you might need to scroll or check itemCount if accessible
  });

  it('shows no options or "no results" message when no options match', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <MultipleSelect
        label="Fruits"
        options={mockOptions}
        selectedValues={[]}
        onChange={mockOnChange}
      />
    );

    // Open the dropdown
    const selectButton = screen.getByRole('button', { name: /fruits/i });
    await user.click(selectButton);

    const searchInput = screen.getByPlaceholderText('Search...');
    // Type a search term that matches nothing
    await user.type(searchInput, 'NonExistentFruit');

    // Verify that none of the original options are shown
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).queryByText('Apple')).not.toBeInTheDocument();
    expect(within(listbox).queryByText('Banana')).not.toBeInTheDocument();
    expect(within(listbox).queryByText('Cherry')).not.toBeInTheDocument();
    expect(within(listbox).queryByText('Date')).not.toBeInTheDocument();
    expect(within(listbox).queryByText('Elderberry')).not.toBeInTheDocument();

    // Additionally, check if the listbox itself is empty or shows a specific message.
    // The current component does not add a "No results" message inside the FixedSizeList.
    // So, we expect the list to be empty of actual options.
    // If FixedSizeList renders a container even when itemCount is 0,
    // we check that no 'menuitem' roles are found within it.
    const menuItems = within(listbox).queryAllByRole('menuitem');
    expect(menuItems.length).toBe(0);
  });
});
