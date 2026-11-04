/**
 * Centralized mapping of Google Authentication errors (Native Android and Web GIS)
 * to user-friendly, localized Polish messages.
 */

interface ErrorLikeObject {
  message?: unknown;
  code?: unknown;
  error?: unknown;
  type?: unknown;
  errorMessage?: unknown;
}

export const formatAuthError = (error: unknown): string => {
  if (!error) {
    return 'Wystąpił nieoczekiwany błąd logowania Google.';
  }

  // Extract raw text and code representation
  let rawMessage = '';
  let rawCode = '';

  if (typeof error === 'string') {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message;
    const errorObj = error as unknown as ErrorLikeObject;
    if (typeof errorObj.code === 'string') {
      rawCode = errorObj.code;
    }
  } else if (typeof error === 'object') {
    const obj = error as ErrorLikeObject;
    rawMessage = typeof obj.message === 'string' 
      ? obj.message 
      : typeof obj.errorMessage === 'string'
        ? obj.errorMessage
        : typeof obj.error === 'string'
          ? obj.error
          : '';
    rawCode = typeof obj.code === 'string' 
      ? obj.code 
      : typeof obj.type === 'string' 
        ? obj.type 
        : '';
  }

  const combined = `${rawCode} ${rawMessage}`.toLowerCase();

  // 1. User cancellation
  if (
    combined.includes('sign_in_canceled') ||
    combined.includes('sign_in_cancelled') ||
    combined.includes('canceled the sign-in') ||
    combined.includes('cancelled the sign-in') ||
    combined.includes('popup_closed_by_user') ||
    combined.includes('user_canceled') ||
    combined.includes('user_cancelled')
  ) {
    return 'Logowanie zostało anulowane.';
  }

  // 2. Missing Google account on Android device or unverified SHA-1 in Google Cloud Console
  if (
    combined.includes('no_credential_available') ||
    combined.includes('nocredentialexception') ||
    combined.includes('no google account is available') ||
    combined.includes('cannot find a matching credential')
  ) {
    return 'Nie znaleziono konta Google na urządzeniu lub trwa weryfikacja aplikacji w Google Cloud. Upewnij się, że w Ustawieniach telefonu dodano konto Google.';
  }

  // 3. Google Play services configuration or missing/outdated
  if (
    combined.includes('provider_configuration_error') ||
    combined.includes('google play services') ||
    combined.includes('getcredentialproviderconfigurationexception')
  ) {
    return 'Usługi Google Play na tym urządzeniu są nieaktualne lub niedostępne. Zaktualizuj usługi Google Play w Sklepie Play.';
  }

  // 4. Origin mismatch (Web GIS / OAuth misconfiguration)
  if (combined.includes('origin_mismatch')) {
    return 'Adres źródłowy aplikacji nie jest zarejestrowany w Google Cloud Console (origin_mismatch).';
  }

  // 5. Network errors
  if (
    combined.includes('network') ||
    combined.includes('failed to fetch') ||
    combined.includes('offline') ||
    combined.includes('sieci')
  ) {
    return 'Brak połączenia z Internetem. Sprawdź sieć i spróbuj ponownie.';
  }

  // 6. Timeout
  if (combined.includes('timeout') || combined.includes('limit czasu')) {
    return 'Upłynął limit czasu oczekiwania na logowanie Google. Spróbuj ponownie.';
  }

  // 7. Session interrupted / window focus lost
  if (combined.includes('przerwane') || combined.includes('zamknięte')) {
    return 'Logowanie zostało przerwane przed ukończeniem autoryzacji.';
  }

  // 8. Missing Client ID
  if (
    combined.includes('client_id_missing') ||
    combined.includes('clientid must be provided') ||
    combined.includes('next_public_google_client_id')
  ) {
    return 'Brak skonfigurowanego identyfikatora Google Client ID.';
  }

  // 10. Required Google Drive scope not granted
  if (
    combined.includes('drive_scope_required') ||
    combined.includes('nie przyznano uprawnień do dysku google') ||
    combined.includes('drive.appdata')
  ) {
    return 'Wymagane uprawnienie: Nie przyznano dostępu do Dysku Google. Bez tego aplikacja nie może synchronizować Twoich ćwiczeń i sal. Połącz konto ponownie i upewnij się, że pole wyboru przy Dysku Google jest zaznaczone.';
  }

  // 9. Expired or revoked access token
  if (
    combined.includes('invalid_token') ||
    combined.includes('invalid_grant') ||
    combined.includes('token has been expired or revoked') ||
    combined.includes('already expired or has already been revoked') ||
    combined.includes('wygasł lub został cofnięty')
  ) {
    return 'Dostęp do Konta Google wygasł lub został cofnięty na Twoim koncie. Zaloguj się ponownie, aby wznowić zabezpieczanie danych.';
  }

  // Prevent double prefixing if the message was already formatted or localized
  const trimmed = rawMessage ? rawMessage.trim() : '';
  if (
    trimmed.startsWith('Błąd logowania Google:') ||
    trimmed.startsWith('Nie znaleziono konta Google') ||
    trimmed.startsWith('Logowanie zostało') ||
    trimmed.startsWith('Usługi Google Play') ||
    trimmed.startsWith('Brak połączenia z Internetem') ||
    trimmed.startsWith('Dostęp do Konta Google') ||
    trimmed.startsWith('Wymagane uprawnienie:')
  ) {
    return trimmed;
  }

  // Fallback with sanitized message or default
  if (trimmed.length > 0) {
    return `Błąd logowania Google: ${trimmed}`;
  }

  return 'Wystąpił błąd podczas logowania Google. Spróbuj ponownie.';
};
