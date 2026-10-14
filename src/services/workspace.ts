import { getAccessToken } from './firebase';
import { TaskReminder } from '../types';

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export interface SpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

// ---------------- Google Sheets Service ----------------
export async function createGrowthSpreadsheet(
  title: string,
  tasks: TaskReminder[]
): Promise<SpreadsheetInfo> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const body = {
    properties: {
      title: title || 'HELIOZ Growth Journal',
    },
    sheets: [
      {
        properties: {
          title: 'Daily Tasks & Growth',
          gridProperties: { rowCount: 100, columnCount: 6 },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Task / Focus Item' } },
                  { userEnteredValue: { stringValue: 'Category' } },
                  { userEnteredValue: { stringValue: 'Scheduled Time' } },
                  { userEnteredValue: { stringValue: 'Status' } },
                  { userEnteredValue: { stringValue: 'Logged Via' } },
                  { userEnteredValue: { stringValue: 'Timestamp' } },
                ],
              },
              ...tasks.map((task) => ({
                values: [
                  { userEnteredValue: { stringValue: task.title } },
                  { userEnteredValue: { stringValue: task.category } },
                  { userEnteredValue: { stringValue: task.time } },
                  {
                    userEnteredValue: {
                      stringValue: task.completed ? 'Completed' : 'Pending',
                    },
                  },
                  { userEnteredValue: { stringValue: 'HELIOZ AI' } },
                  { userEnteredValue: { stringValue: new Date().toLocaleDateString() } },
                ],
              })),
            ],
          },
        ],
      },
      {
        properties: {
          title: 'Gita Reflections & Notes',
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Sloka Reference' } },
                  { userEnteredValue: { stringValue: 'Key Principle' } },
                  { userEnteredValue: { stringValue: 'Personal Reflection' } },
                  { userEnteredValue: { stringValue: 'Date' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Bhagavad Gita 2.47' } },
                  { userEnteredValue: { stringValue: 'Karmanye Vadhikaraste' } },
                  {
                    userEnteredValue: {
                      stringValue:
                        'Focus 100% on high-quality action in 3D printing and studies; let go of anxious attachment to results.',
                    },
                  },
                  { userEnteredValue: { stringValue: new Date().toLocaleDateString() } },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create spreadsheet: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
    title: data.properties.title,
  };
}

export async function appendTaskToSpreadsheet(
  spreadsheetId: string,
  task: TaskReminder
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const range = 'Daily Tasks & Growth!A:F';
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [
          [
            task.title,
            task.category,
            task.time,
            task.completed ? 'Completed' : 'Pending',
            'HELIOZ AI',
            new Date().toLocaleString(),
          ],
        ],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to append task to spreadsheet');
  }
}

export async function fetchSpreadsheetRows(spreadsheetId: string): Promise<string[][]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const range = 'Daily Tasks & Growth!A1:F30';
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch spreadsheet rows');
  }

  const data = await response.json();
  return data.values || [];
}

// ---------------- Google Calendar Service ----------------
export async function listUpcomingCalendarEvents(): Promise<CalendarEventItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const now = new Date().toISOString();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      now
    )}&maxResults=15&singleEvents=true&orderBy=startTime`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch calendar events');
  }

  const data = await response.json();
  return data.items || [];
}

export async function createGoogleCalendarEvent(
  title: string,
  description: string,
  startTime: Date,
  durationMinutes: number = 45
): Promise<CalendarEventItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  const eventPayload = {
    summary: title,
    description: description || 'Scheduled via HELIOZ AI Personal Growth Partner',
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'popup', minutes: 5 },
      ],
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create calendar event');
  }

  return await response.json();
}

export async function deleteGoogleCalendarEvent(eventId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(
      eventId
    )}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete calendar event');
  }
}
