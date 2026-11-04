import { describe, it, expect } from 'vitest';
import { formatAuthError } from '@/services/auth/authErrors';

describe('formatAuthError (#49)', () => {
  it('maps native NO_CREDENTIAL_AVAILABLE and missing account messages to helpful Polish explanation', () => {
    expect(formatAuthError('No Google account is available on this device.')).toBe(
      'Nie znaleziono konta Google na urządzeniu lub trwa weryfikacja aplikacji w Google Cloud. Upewnij się, że w Ustawieniach telefonu dodano konto Google.'
    );

    expect(formatAuthError({ code: 'NO_CREDENTIAL_AVAILABLE' })).toBe(
      'Nie znaleziono konta Google na urządzeniu lub trwa weryfikacja aplikacji w Google Cloud. Upewnij się, że w Ustawieniach telefonu dodano konto Google.'
    );

    expect(formatAuthError(new Error('androidx.credentials.exceptions.NoCredentialException'))).toBe(
      'Nie znaleziono konta Google na urządzeniu lub trwa weryfikacja aplikacji w Google Cloud. Upewnij się, że w Ustawieniach telefonu dodano konto Google.'
    );
  });

  it('maps cancellation errors to clear Polish cancellation notification', () => {
    expect(formatAuthError('The user canceled the sign-in flow.')).toBe('Logowanie zostało anulowane.');
    expect(formatAuthError({ code: 'SIGN_IN_CANCELED' })).toBe('Logowanie zostało anulowane.');
    expect(formatAuthError({ error: 'popup_closed_by_user' })).toBe('Logowanie zostało anulowane.');
    expect(formatAuthError(new Error('User_canceled'))).toBe('Logowanie zostało anulowane.');
  });

  it('maps Google Play Services configuration errors to actionable update instruction', () => {
    expect(
      formatAuthError(
        'The credential provider is not configured correctly. Make sure that Google Play services is available and up to date.'
      )
    ).toBe('Usługi Google Play na tym urządzeniu są nieaktualne lub niedostępne. Zaktualizuj usługi Google Play w Sklepie Play.');

    expect(formatAuthError({ code: 'PROVIDER_CONFIGURATION_ERROR' })).toBe(
      'Usługi Google Play na tym urządzeniu są nieaktualne lub niedostępne. Zaktualizuj usługi Google Play w Sklepie Play.'
    );
  });

  it('maps origin mismatch web error correctly', () => {
    expect(formatAuthError(new Error('Error 400: origin_mismatch'))).toBe(
      'Adres źródłowy aplikacji nie jest zarejestrowany w Google Cloud Console (origin_mismatch).'
    );
  });

  it('maps network errors to connection instruction', () => {
    expect(formatAuthError(new Error('Failed to fetch'))).toBe(
      'Brak połączenia z Internetem. Sprawdź sieć i spróbuj ponownie.'
    );
    expect(formatAuthError('NetworkError when attempting to fetch resource')).toBe(
      'Brak połączenia z Internetem. Sprawdź sieć i spróbuj ponownie.'
    );
  });

  it('maps timeout errors to retry instruction', () => {
    expect(formatAuthError('Upłynął limit czasu oczekiwania na logowanie Google (35s).')).toBe(
      'Upłynął limit czasu oczekiwania na logowanie Google. Spróbuj ponownie.'
    );
    expect(formatAuthError(new Error('Authentication timeout exceeded'))).toBe(
      'Upłynął limit czasu oczekiwania na logowanie Google. Spróbuj ponownie.'
    );
  });

  it('maps interrupted sessions and focus loss gracefully', () => {
    expect(formatAuthError('Logowanie zostało przerwane lub okno autoryzacji zostało zamknięte.')).toBe(
      'Logowanie zostało przerwane przed ukończeniem autoryzacji.'
    );
  });

  it('handles empty, null, and unknown errors defensively', () => {
    expect(formatAuthError(null)).toBe('Wystąpił nieoczekiwany błąd logowania Google.');
    expect(formatAuthError(undefined)).toBe('Wystąpił nieoczekiwany błąd logowania Google.');
    expect(formatAuthError(new Error('Custom unexpected runtime exception'))).toBe(
      'Błąd logowania Google: Custom unexpected runtime exception'
    );
  });
});

