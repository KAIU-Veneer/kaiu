const NOTIFICATION_EMAIL = 'kaiuveneer@gmail.com';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) throw new Error('Sheet1 was not found.');

  const headers = ['Date', 'Name', 'Email', 'Phone', 'Message', 'Project Type'];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#332824')
      .setFontColor('#FFF8F0')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  } else {
    const currentColumnCount = Math.max(sheet.getLastColumn(), 5);
    const currentHeaders = sheet.getRange(1, 1, 1, currentColumnCount).getValues()[0];
    const hasProjectType = currentHeaders.some(
      (header) => String(header).trim().toLowerCase() === 'project type'
    );

    if (!hasProjectType) {
      const newColumn = currentColumnCount + 1;
      sheet.getRange(1, newColumn).setValue('Project Type')
        .setFontWeight('bold')
        .setBackground('#332824')
        .setFontColor('#FFF8F0')
        .setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
  }

  const columnCount = sheet.getLastColumn();
  const columnNames = sheet.getRange(1, 1, 1, columnCount).getValues()[0]
    .map((header) => String(header).trim().toLowerCase());
  const rowValues = new Array(columnCount).fill('');
  const values = {
    date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd MMM yyyy, HH:mm'),
    name: String(data.name || '').trim(),
    email: String(data.email || '').trim(),
    phone: "'" + String(data.phone || '').trim(),
    message: String(data.message || '').trim(),
    'project type': String(data.projectType || '').trim(),
  };

  columnNames.forEach((name, index) => {
    if (Object.prototype.hasOwnProperty.call(values, name)) rowValues[index] = values[name];
  });
  sheet.appendRow(rowValues);

  const lastRow = sheet.getLastRow();
  const newRow = sheet.getRange(lastRow, 1, 1, rowValues.length);
  newRow.setVerticalAlignment('middle').setWrap(true);
  newRow.setBackground(lastRow % 2 === 0 ? '#e2e3e2' : '#FFFFFF');
  sheet.autoResizeColumns(1, rowValues.length);

  // Send a generic alert only. Submission details stay in the spreadsheet.
  try {
    MailApp.sendEmail(
      NOTIFICATION_EMAIL,
      'New KAIU website contact received',
      'A new contact form submission was added to the customer spreadsheet. Open the sheet to review it.'
    );
  } catch (error) {
    console.error('Contact notification email failed: ' + error);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
