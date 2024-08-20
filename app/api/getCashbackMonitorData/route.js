import puppeteer from "puppeteer";
import { google } from "googleapis";

export const GET = async () => {
  const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
  const auth = new google.auth.JWT("XXX", null, "XXX", scopes);

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = "XXX";
  const range = "XXX"; // Adjust range as needed

  try {
    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    // Extract URLs from the sheet
    const urls = response.data.values.map((item) => item[0]);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const results = {};

    for (const sheetUrl of urls) {
      // Parse the domain from the URL
      const parsedUrl = new URL(sheetUrl);
      const domain = parsedUrl.hostname;
      const domain_actual = domain.match(/www\.([^.]*)\.com/);
      // Construct the URL dynamically if needed
      const targetUrl = `https://www.cashbackmonitor.com/cashback-store/${domain_actual[1]}/`;

      await page.goto(targetUrl, { waitUntil: "networkidle2" });

      // Extract data from the constructed URL
      const data = await page.evaluate(() => {
        const cashbackContainer = document.querySelector(".lo");
        const cashbackName = cashbackContainer
          ? cashbackContainer.querySelector("a").textContent
          : "No cashback 🤑";
        const cashbackPercentage = document.querySelector("#ra0")
          ? "" + document.querySelector("#ra0").textContent
          : "";

        return {
          cashbackName,
          cashbackPercentage,
        };
      });
      results[sheetUrl] = [data, domain_actual[1]];
    }

    console.log(results);

    await browser.close();

    return new Response(JSON.stringify(results || "No data found"), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Invoke the GET function
