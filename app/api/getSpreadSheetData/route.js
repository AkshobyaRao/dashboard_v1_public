import { google } from "googleapis"; // importing the api
export async function GET() {
  const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

  // Create an OAuth2 client with the loaded credentials.
  const auth = new google.auth.JWT("XXX", null, "XXX", scopes);

  // Create a Sheets API client with the authorized client.
  const sheets = google.sheets({ version: "v4", auth });

  // The ID and range of the spreadsheet to access.
  const spreadsheetId = "XXX";
  const range = "XXX"; // Adjust range as needed.

  try {
    // Read data from the specified range in the spreadsheet.
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    // Send the data back to the client.
    return new Response(JSON.stringify(response.data.values || []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error accessing spreadsheet:", error);
    return new Response(
      JSON.stringify({ error: "Error accessing spreadsheet" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
