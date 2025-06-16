import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Needed for MUI components

// Mock CSV data
const mockCsvData = `id,name,number,mod3,mod4,mod5,mod6
1,Alice,10,1,2,0,4
2,Bob,20,2,0,0,2
3,Charlie,30,0,2,0,0
4,David,15,0,3,0,3
5,Eve,25,1,1,0,1`;

const theme = createTheme();

// Helper function to render the component with ThemeProvider
const renderApp = () => {
  return render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
};

// Mock fetch
global.fetch = vi.fn();

const mockFetchSuccess = () => {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(mockCsvData),
  });
};

describe('App Integration Tests - Table Filtering', () => {
  beforeEach(() => {
    mockFetchSuccess();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initially displays all rows from mock CSV data', async () => {
    renderApp();

    // Wait for loading to complete and table to render
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    // Check for some data from each row to confirm they are rendered
    // Column headers: id, name, number, mod3, mod4, mod5, mod6
    // Row 1: 1,Alice,10,1,2,0,4
    // Row 2: 2,Bob,20,2,0,0,2
    // Row 3: 3,Charlie,30,0,2,0,0
    // Row 4: 4,David,15,0,3,0,3
    // Row 5: 5,Eve,25,1,1,0,1
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument(); // Name from row 1
      expect(screen.getByText('Bob')).toBeInTheDocument();   // Name from row 2
      expect(screen.getByText('Charlie')).toBeInTheDocument(); // Name from row 3
      expect(screen.getByText('David')).toBeInTheDocument(); // Name from row 4
      expect(screen.getByText('Eve')).toBeInTheDocument();   // Name from row 5
    });

    // Check number options are populated in the "Number" MultiSelect
    const user = userEvent.setup();
    const numberSelectButton = screen.getByRole('button', { name: /number/i });
    await user.click(numberSelectButton);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '20' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '30' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '15' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '25' })).toBeInTheDocument();
    });
     // Close the dropdown
    await user.keyboard('{escape}');
  });

  it('filters table rows based on a single selection in "Number" MultiSelect', async () => {
    const user = userEvent.setup();
    renderApp();

    // Wait for initial data loading
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    // Open the "Number" MultiSelect
    const numberSelectButton = screen.getByRole('button', { name: /number/i });
    await user.click(numberSelectButton);

    // Select '10' from the options
    // The options are MenuItems, which have role 'option'
    const option10 = await screen.findByRole('option', { name: '10' });
    await user.click(option10);

    // Close the dropdown (optional, clicking an item might close it)
    await user.keyboard('{escape}');

    // Verify that only rows with number '10' are displayed
    // Row 1: 1,Alice,10,1,2,0,4
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument(); // Belongs to number 10
    });

    // Verify that other rows are not displayed
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();   // Belongs to number 20
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument(); // Belongs to number 30
    expect(screen.queryByText('David')).not.toBeInTheDocument(); // Belongs to number 15
    expect(screen.queryByText('Eve')).not.toBeInTheDocument();   // Belongs to number 25
  });

  it('filters table rows based on multiple selections in "Number" MultiSelect', async () => {
    const user = userEvent.setup();
    renderApp();

    // Wait for initial data loading
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    // Open the "Number" MultiSelect
    const numberSelectButton = screen.getByRole('button', { name: /number/i });
    await user.click(numberSelectButton);

    // Select '10'
    const option10 = await screen.findByRole('option', { name: '10' });
    await user.click(option10);

    // Select '25' (dropdown should still be open for multiple selections)
    const option25 = await screen.findByRole('option', { name: '25' });
    await user.click(option25);

    // Close the dropdown
    await user.keyboard('{escape}');

    // Verify that rows with number '10' OR '25' are displayed
    // Row 1: 1,Alice,10,1,2,0,4
    // Row 5: 5,Eve,25,1,1,0,1
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument(); // Belongs to number 10
      expect(screen.getByText('Eve')).toBeInTheDocument();   // Belongs to number 25
    });

    // Verify that other rows are not displayed
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();   // Belongs to number 20
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument(); // Belongs to number 30
    expect(screen.queryByText('David')).not.toBeInTheDocument(); // Belongs to number 15
  });

  it('updates table correctly when a selected item is deselected', async () => {
    const user = userEvent.setup();
    renderApp();

    // Wait for initial data loading
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    // Open the "Number" MultiSelect
    const numberSelectButton = screen.getByRole('button', { name: /number/i });
    await user.click(numberSelectButton);

    // Select '10' and '20'
    const option10 = await screen.findByRole('option', { name: '10' });
    await user.click(option10);
    const option20 = await screen.findByRole('option', { name: '20' });
    await user.click(option20);

    // Close the dropdown
    await user.keyboard('{escape}');

    // Verify 'Alice' (10) and 'Bob' (20) are present
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();

    // Re-open the "Number" MultiSelect
    await user.click(numberSelectButton);

    // Deselect '10' (by clicking it again)
    // Need to find it again as the list might have re-rendered
    const selectedOption10 = await screen.findByRole('option', { name: '10' });
    // It should have aria-selected="true" or a checkbox checked.
    // For this component, it's a MenuItem with a Checkbox.
    // We are clicking the MenuItem itself.
    await user.click(selectedOption10);

    // Close the dropdown
    await user.keyboard('{escape}');

    // Verify that only 'Bob' (20) is displayed
    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('displays all rows when all selections are cleared', async () => {
    const user = userEvent.setup();
    renderApp();

    // Wait for initial data loading
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    // Open the "Number" MultiSelect
    const numberSelectButton = screen.getByRole('button', { name: /number/i });
    await user.click(numberSelectButton);

    // Select '15' and '30'
    const option15 = await screen.findByRole('option', { name: '15' });
    await user.click(option15);
    const option30 = await screen.findByRole('option', { name: '30' });
    await user.click(option30);

    // Close the dropdown
    await user.keyboard('{escape}');

    // Verify 'David' (15) and 'Charlie' (30) are present
    await waitFor(() => {
      expect(screen.getByText('David')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Eve')).not.toBeInTheDocument();

    // Re-open the "Number" MultiSelect
    await user.click(numberSelectButton);

    // Deselect '15'
    const selectedOption15 = await screen.findByRole('option', { name: '15' });
    await user.click(selectedOption15);

    // Deselect '30'
    const selectedOption30 = await screen.findByRole('option', { name: '30' });
    await user.click(selectedOption30);

    // Close the dropdown
    await user.keyboard('{escape}');

    // Verify that all original rows are displayed again
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.getByText('David')).toBeInTheDocument();
      expect(screen.getByText('Eve')).toBeInTheDocument();
    });
  });
});
