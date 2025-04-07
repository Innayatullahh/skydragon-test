

import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import MeetingView from '../../views/admin/meeting/meetingView'; 
import { BrowserRouter as Router } from 'react-router-dom'; 

const mockProps = {
  onClose: jest.fn(),
  isOpen: true,
  info: { event: { id: '1' } },
  fetchData: jest.fn(),
  setAction: jest.fn(),
  action: 'view',
  access: { view: true, update: true, delete: true }
};

describe('MeetingView', () => {
  test('renders MeetingView modal with loading spinner', async () => {
    render(
      <Router>
        <ChakraProvider>
          <MeetingView {...mockProps} />
        </ChakraProvider>
      </Router>
    );

    // Verify that the spinner is displayed when data is being fetched
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Simulate loading state by waiting for spinner to disappear
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());

    // Verify that the modal is open and contains the modal header
    expect(screen.getByText('Meeting')).toBeInTheDocument();
  });

  test('renders MeetingView modal with agenda data', async () => {
    // Mock data to simulate a successful API response
    mockProps.info = { event: { id: '1' }, agenda: 'Meeting Agenda', dateTime: '2025-04-01T10:00:00' };

    render(
      <Router>
        <ChakraProvider>
          <MeetingView {...mockProps} />
        </ChakraProvider>
      </Router>
    );

    // Simulate loading state
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());

    // Verify agenda data is rendered
    expect(screen.getByText('Meeting Agenda')).toBeInTheDocument();
    expect(screen.getByText('April 1, 2025 10:00 AM')).toBeInTheDocument(); // Date formatting using moment.js
  });
});
