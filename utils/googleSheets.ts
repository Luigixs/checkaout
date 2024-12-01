import { google } from 'googleapis';

export async function appendToSheet(values: string[]) {
  try {
    console.log('Iniciando configuração do Google Sheets...');
    
    // Validate credentials
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('Credenciais do Google não encontradas');
    }

    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('Credenciais parseadas com sucesso');

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('Auth configurado, inicializando cliente do Sheets...');
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('ID da planilha não encontrado nas variáveis de ambiente');
    }
    console.log('ID da planilha encontrado:', spreadsheetId);

    console.log('Enviando dados para o Google Sheets...');
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    console.log('Resposta do Google Sheets:', response.status, response.statusText);
    return response.data;
  } catch (error) {
    console.error('Erro detalhado ao salvar no Google Sheets:', error);
    if (error instanceof Error) {
      throw new Error(`Erro ao salvar na planilha: ${error.message}`);
    }
    throw error;
  }
}

