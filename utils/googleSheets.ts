import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function appendToSheet(values: string[]) {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const range = 'A:E'; // Adjusted to match 5 fields

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [values], // Wrap values in an array to create a new row
      },
    });

    console.log('Dados adicionados com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar dados ao Google Sheets:', error);
    throw error;
  }
}

