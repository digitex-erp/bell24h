import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StitchTestPage from './StitchTestPage';
import { StitchContext } from '../contexts/StitchContext';

describe('StitchTestPage Critical', () => {
  it('shows loading state', () => {
    render(
      <StitchContext.Provider value={{ stitchClient: null, isLoading: true, error: null }}>
        <StitchTestPage />
      </StitchContext.Provider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state if Stitch fails', () => {
    render(
      <StitchContext.Provider value={{ stitchClient: null, isLoading: false, error: 'Failed to connect' }}>
        <StitchTestPage />
      </StitchContext.Provider>
    );
    expect(screen.getByText(/Failed to connect/)).toBeInTheDocument();
  });

  it('updates UI on successful DB test', async () => {
    const fakeClient = {
      getServiceClient: () => ({
        db: () => ({
          collection: () => ({ findOne: async () => ({ _id: 1 }) })
        })
      })
    };
    render(
      <StitchContext.Provider value={{ stitchClient: fakeClient, isLoading: false, error: null }}>
        <StitchTestPage />
      </StitchContext.Provider>
    );
    const btn = screen.getByText(/Test Database Connection/);
    fireEvent.click(btn);
    await waitFor(() => expect(screen.getByText(/Connected! Found/)).toBeInTheDocument());
  });

  it('handles DB test failure', async () => {
    const fakeClient = {
      getServiceClient: () => ({
        db: () => ({
          collection: () => ({ findOne: async () => { throw new Error('DB error'); } })
        })
      })
    };
    render(
      <StitchContext.Provider value={{ stitchClient: fakeClient, isLoading: false, error: null }}>
        <StitchTestPage />
      </StitchContext.Provider>
    );
    const btn = screen.getByText(/Test Database Connection/);
    fireEvent.click(btn);
    await waitFor(() => expect(screen.getByText(/Error: DB error/)).toBeInTheDocument());
  });
});
