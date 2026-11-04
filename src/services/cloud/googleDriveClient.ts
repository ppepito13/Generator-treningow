import type { GoogleDriveFile } from '@/types/auth';

export const DEFAULT_BACKUP_FILE_NAME = 'sportsway_sync_backup.json';
export const DRIVE_API_BASE_URL = 'https://www.googleapis.com/drive/v3/files';
export const DRIVE_UPLOAD_BASE_URL = 'https://www.googleapis.com/upload/drive/v3/files';

export type GoogleDriveErrorCode = 
  | 'AUTH_EXPIRED' 
  | 'FORBIDDEN' 
  | 'NOT_FOUND' 
  | 'NETWORK_ERROR' 
  | 'API_ERROR' 
  | 'PARSE_ERROR';

export class GoogleDriveError extends Error {
  constructor(
    public readonly code: GoogleDriveErrorCode,
    message: string,
    public readonly statusCode?: number,
    public readonly rawError?: unknown
  ) {
    super(message);
    this.name = 'GoogleDriveError';
  }
}

/**
 * Searches for an existing backup file in the private appDataFolder.
 */
export const findBackupFile = async (
  accessToken: string,
  fileName = DEFAULT_BACKUP_FILE_NAME
): Promise<GoogleDriveFile | null> => {
  if (!accessToken) {
    throw new GoogleDriveError('AUTH_EXPIRED', 'Brak tokena autoryzacji Google Drive.', 401);
  }

  const query = encodeURIComponent(`name='${fileName}' and trashed=false`);
  const url = `${DRIVE_API_BASE_URL}?spaces=appDataFolder&fields=files(id,name,modifiedTime)&q=${query}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (res.status === 401) {
      throw new GoogleDriveError('AUTH_EXPIRED', 'Sesja autoryzacyjna Google wygasła. Zaloguj się ponownie.', 401);
    }
    if (res.status === 403) {
      throw new GoogleDriveError(
        'FORBIDDEN',
        'Brak uprawnień lub usługa Google Drive API nie jest włączona w projekcie Google Cloud.',
        403
      );
    }
    if (!res.ok) {
      throw new GoogleDriveError('API_ERROR', `Błąd zapytania Google Drive: HTTP ${res.status}`, res.status);
    }

    const data = await res.json() as { files?: GoogleDriveFile[] };
    if (data.files && data.files.length > 0) {
      const first = data.files[0];
      return {
        id: first.id,
        name: first.name,
        modifiedTime: first.modifiedTime,
      };
    }

    return null;
  } catch (err: unknown) {
    if (err instanceof GoogleDriveError) throw err;
    throw new GoogleDriveError('NETWORK_ERROR', 'Błąd sieci podczas wyszukiwania pliku w Google Drive.', undefined, err);
  }
};

/**
 * Downloads and parses backup file content from appDataFolder.
 */
export const downloadBackupFile = async <T = unknown>(
  accessToken: string,
  fileId: string
): Promise<T> => {
  if (!accessToken) {
    throw new GoogleDriveError('AUTH_EXPIRED', 'Brak tokena autoryzacji Google Drive.', 401);
  }
  if (!fileId) {
    throw new GoogleDriveError('NOT_FOUND', 'Nie podano identyfikatora pliku do pobrania.', 404);
  }

  const url = `${DRIVE_API_BASE_URL}/${encodeURIComponent(fileId)}?alt=media`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 401) {
      throw new GoogleDriveError('AUTH_EXPIRED', 'Sesja autoryzacyjna Google wygasła. Zaloguj się ponownie.', 401);
    }
    if (res.status === 403) {
      throw new GoogleDriveError('FORBIDDEN', 'Brak dostępu do pliku w Google Drive.', 403);
    }
    if (res.status === 404) {
      throw new GoogleDriveError('NOT_FOUND', 'Plik kopii zapasowej nie został odnaleziony w Google Drive.', 404);
    }
    if (!res.ok) {
      throw new GoogleDriveError('API_ERROR', `Nie udało się pobrać pliku: HTTP ${res.status}`, res.status);
    }

    const text = await res.text();
    try {
      return JSON.parse(text) as T;
    } catch (parseErr) {
      throw new GoogleDriveError('PARSE_ERROR', 'Niepoprawny format danych JSON w pliku kopii zapasowej.', undefined, parseErr);
    }
  } catch (err: unknown) {
    if (err instanceof GoogleDriveError) throw err;
    throw new GoogleDriveError('NETWORK_ERROR', 'Błąd sieci podczas pobierania kopii z Google Drive.', undefined, err);
  }
};

/**
 * Creates or updates backup file in appDataFolder.
 */
export const uploadBackupFile = async (
  accessToken: string,
  content: string | object,
  existingFileId?: string,
  fileName = DEFAULT_BACKUP_FILE_NAME
): Promise<GoogleDriveFile> => {
  if (!accessToken) {
    throw new GoogleDriveError('AUTH_EXPIRED', 'Brak tokena autoryzacji Google Drive.', 401);
  }

  const payloadString = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

  try {
    if (existingFileId) {
      // Update existing file using PATCH media upload
      const url = `${DRIVE_UPLOAD_BASE_URL}/${encodeURIComponent(existingFileId)}?uploadType=media`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: payloadString,
      });

      if (res.status === 401) {
        throw new GoogleDriveError('AUTH_EXPIRED', 'Sesja autoryzacyjna Google wygasła. Zaloguj się ponownie.', 401);
      }
      if (res.status === 403) {
        throw new GoogleDriveError('FORBIDDEN', 'Brak uprawnień do zapisu pliku w Google Drive.', 403);
      }
      if (!res.ok) {
        throw new GoogleDriveError('API_ERROR', `Błąd zapisu pliku w Google Drive: HTTP ${res.status}`, res.status);
      }

      const data = await res.json() as GoogleDriveFile;
      return {
        id: data.id || existingFileId,
        name: data.name || fileName,
        modifiedTime: data.modifiedTime || new Date().toISOString(),
      };
    } else {
      // Create new file in appDataFolder using multipart upload
      const boundary = `-------sportsway_boundary_${Date.now()}`;
      const url = `${DRIVE_UPLOAD_BASE_URL}?uploadType=multipart`;

      const metadata = {
        name: fileName,
        parents: ['appDataFolder'],
      };

      const multipartBody = 
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${payloadString}\r\n` +
        `--${boundary}--`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      });

      if (res.status === 401) {
        throw new GoogleDriveError('AUTH_EXPIRED', 'Sesja autoryzacyjna Google wygasła. Zaloguj się ponownie.', 401);
      }
      if (res.status === 403) {
        throw new GoogleDriveError(
          'FORBIDDEN',
          'Brak uprawnień lub usługa Google Drive API nie jest włączona w projekcie Google Cloud.',
          403
        );
      }
      if (!res.ok) {
        throw new GoogleDriveError('API_ERROR', `Błąd tworzenia pliku w Google Drive: HTTP ${res.status}`, res.status);
      }

      const data = await res.json() as GoogleDriveFile;
      return {
        id: data.id,
        name: data.name || fileName,
        modifiedTime: data.modifiedTime || new Date().toISOString(),
      };
    }
  } catch (err: unknown) {
    if (err instanceof GoogleDriveError) throw err;
    throw new GoogleDriveError('NETWORK_ERROR', 'Błąd sieci podczas wysyłania kopii do Google Drive.', undefined, err);
  }
};

