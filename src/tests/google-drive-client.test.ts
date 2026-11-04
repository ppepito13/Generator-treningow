import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  findBackupFile,
  downloadBackupFile,
  uploadBackupFile,
  GoogleDriveError,
  DEFAULT_BACKUP_FILE_NAME,
} from '@/services/cloud/googleDriveClient';
import {
  getValidAccessToken,
  setMockAuthSession,
  GOOGLE_DRIVE_APPDATA_SCOPE,
  DEFAULT_SCOPES,
} from '@/services/auth/googleAuth';

describe('Google Drive Client & Scopes (#40.1)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setMockAuthSession(null);
  });

  describe('OAuth Scope Configuration', () => {
    it('includes google drive appdata scope in default scopes', () => {
      expect(GOOGLE_DRIVE_APPDATA_SCOPE).toBe('https://www.googleapis.com/auth/drive.appdata');
      expect(DEFAULT_SCOPES).toContain(GOOGLE_DRIVE_APPDATA_SCOPE);
      expect(DEFAULT_SCOPES).toContain('openid');
      expect(DEFAULT_SCOPES).toContain('email');
      expect(DEFAULT_SCOPES).toContain('profile');
    });

    it('returns valid access token when session is active and unexpired', () => {
      setMockAuthSession({
        accessToken: 'valid-test-token',
        expiresAt: Date.now() + 3600 * 1000,
      });

      expect(getValidAccessToken()).toBe('valid-test-token');
    });

    it('returns null when access token is expired or missing', () => {
      setMockAuthSession({
        accessToken: 'expired-test-token',
        expiresAt: Date.now() - 1000, // already expired
      });

      expect(getValidAccessToken()).toBeNull();

      setMockAuthSession(null);
      expect(getValidAccessToken()).toBeNull();
    });
  });

  describe('findBackupFile', () => {
    it('returns GoogleDriveFile metadata when file exists in appDataFolder', async () => {
      const mockResponse = {
        files: [
          {
            id: 'drive_file_123',
            name: DEFAULT_BACKUP_FILE_NAME,
            modifiedTime: '2026-11-04T10:00:00.000Z',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await findBackupFile('mock-token');
      expect(result).toEqual({
        id: 'drive_file_123',
        name: DEFAULT_BACKUP_FILE_NAME,
        modifiedTime: '2026-11-04T10:00:00.000Z',
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('spaces=appDataFolder'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('returns null when no matching backup file exists in appDataFolder', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ files: [] }),
      } as Response);

      const result = await findBackupFile('mock-token');
      expect(result).toBeNull();
    });

    it('throws AUTH_EXPIRED GoogleDriveError on HTTP 401', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      await expect(findBackupFile('bad-token')).rejects.toThrowError(GoogleDriveError);
      await expect(findBackupFile('bad-token')).rejects.toMatchObject({
        code: 'AUTH_EXPIRED',
        statusCode: 401,
      });
    });

    it('throws FORBIDDEN GoogleDriveError on HTTP 403', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      await expect(findBackupFile('token-no-drive-access')).rejects.toMatchObject({
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    });

    it('throws AUTH_EXPIRED when accessToken is empty', async () => {
      await expect(findBackupFile('')).rejects.toMatchObject({
        code: 'AUTH_EXPIRED',
        statusCode: 401,
      });
    });
  });

  describe('downloadBackupFile', () => {
    it('downloads and parses JSON payload from Google Drive alt=media endpoint', async () => {
      const mockPayload = {
        version: 1,
        exercises: [{ id: 'ex_1', nazwa: 'Test Exercise' }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockPayload),
      } as Response);

      const data = await downloadBackupFile('mock-token', 'drive_file_123');
      expect(data).toEqual(mockPayload);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('drive_file_123?alt=media'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('throws PARSE_ERROR if file contents are not valid JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'NOT_JSON_DATA',
      } as Response);

      await expect(downloadBackupFile('mock-token', 'file_corrupt')).rejects.toMatchObject({
        code: 'PARSE_ERROR',
      });
    });

    it('throws NOT_FOUND on HTTP 404 or empty fileId', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(downloadBackupFile('mock-token', 'non_existing')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });

      await expect(downloadBackupFile('mock-token', '')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('uploadBackupFile', () => {
    it('creates new file via multipart upload when existingFileId is omitted', async () => {
      const mockPayload = { test: 'content' };
      const mockCreatedFile = {
        id: 'new_drive_id_999',
        name: DEFAULT_BACKUP_FILE_NAME,
        modifiedTime: '2026-11-04T10:15:00.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCreatedFile,
      } as Response);

      const result = await uploadBackupFile('mock-token', mockPayload);
      expect(result).toEqual(mockCreatedFile);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('uploadType=multipart'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
            'Content-Type': expect.stringContaining('multipart/related; boundary='),
          }),
          body: expect.stringContaining('appDataFolder'),
        })
      );
    });

    it('updates existing file via PATCH when existingFileId is provided', async () => {
      const mockPayload = { test: 'updated_content' };
      const mockUpdatedFile = {
        id: 'existing_id_123',
        name: DEFAULT_BACKUP_FILE_NAME,
        modifiedTime: '2026-11-04T10:20:00.000Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockUpdatedFile,
      } as Response);

      const result = await uploadBackupFile('mock-token', mockPayload, 'existing_id_123');
      expect(result).toEqual(mockUpdatedFile);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('existing_id_123?uploadType=media'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json; charset=UTF-8',
          }),
          body: JSON.stringify(mockPayload, null, 2),
        })
      );
    });

    it('throws FORBIDDEN when user lacks write permission or drive API is disabled', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      await expect(uploadBackupFile('mock-token', {})).rejects.toMatchObject({
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    });

    it('throws AUTH_EXPIRED when attempting upload with empty token', async () => {
      await expect(uploadBackupFile('', {})).rejects.toMatchObject({
        code: 'AUTH_EXPIRED',
        statusCode: 401,
      });
    });
  });
});
