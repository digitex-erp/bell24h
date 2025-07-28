import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Profile } from './Profile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Profile', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Profile />
      </QueryClientProvider>
    );
  };

  it('renders the profile with all sections', async () => {
    renderComponent();

    expect(screen.getByText(/profile information/i)).toBeInTheDocument();
    expect(screen.getByText(/security settings/i)).toBeInTheDocument();
    expect(screen.getByText(/notification preferences/i)).toBeInTheDocument();
    expect(screen.getByText(/company information/i)).toBeInTheDocument();
  });

  it('displays user information', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/test user/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/buyer/i)).toBeInTheDocument();
    });
  });

  it('updates profile information', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Updated Name' },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '+1234567890' },
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });

  it('changes password', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'current123' },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'new123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'new123' },
    });

    const changeButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(screen.getByText(/password changed successfully/i)).toBeInTheDocument();
    });
  });

  it('validates password change', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'current123' },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'new123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'different123' },
    });

    const changeButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('updates notification preferences', async () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText(/email notifications/i));
    fireEvent.click(screen.getByLabelText(/sms notifications/i));

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/preferences updated successfully/i)).toBeInTheDocument();
    });
  });

  it('updates company information', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'Updated Company' },
    });
    fireEvent.change(screen.getByLabelText(/company address/i), {
      target: { value: '123 Updated St' },
    });

    const saveButton = screen.getByRole('button', { name: /save company info/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/company information updated successfully/i)).toBeInTheDocument();
    });
  });

  it('handles profile picture upload', async () => {
    renderComponent();

    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/profile picture/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/profile picture updated successfully/i)).toBeInTheDocument();
    });
  });

  it('handles document upload', async () => {
    renderComponent();

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/company documents/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/document uploaded successfully/i)).toBeInTheDocument();
    });
  });

  it('displays activity history', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/activity history/i)).toBeInTheDocument();
      expect(screen.getByText(/recent logins/i)).toBeInTheDocument();
      expect(screen.getByText(/recent actions/i)).toBeInTheDocument();
    });
  });

  it('enables two-factor authentication', async () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText(/enable 2fa/i));

    await waitFor(() => {
      expect(screen.getByText(/scan qr code/i)).toBeInTheDocument();
      expect(screen.getByText(/enter verification code/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: '123456' },
    });

    const verifyButton = screen.getByRole('button', { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText(/2fa enabled successfully/i)).toBeInTheDocument();
    });
  });

  it('displays security settings', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/login history/i)).toBeInTheDocument();
      expect(screen.getByText(/active sessions/i)).toBeInTheDocument();
      expect(screen.getByText(/security logs/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/users/me', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error loading profile/i)).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('maintains state after page refresh', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/test user/i)).toBeInTheDocument();
    });

    // Simulate page refresh
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/test user/i)).toBeInTheDocument();
    });
  });
}); 