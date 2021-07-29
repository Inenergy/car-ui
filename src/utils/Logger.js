const path = require('path');

// polyfills required by exceljs
require('core-js/modules/es.promise');
require('core-js/modules/es.string.includes');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('regenerator-runtime/runtime');

const ExcelJS = require('exceljs/dist/es5')
const { writeFile } = require('fs');
const {
  __,
  BATTERY_CHARACTERISTICS,
  STORED_VALUES,
  FUEL_CELL_CHARACTERISTICS,
} = require('../constants');

class XLSLogger {
  constructor() {
    this._thinBorder = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
      left: { style: 'thin' },
    };
  }

  init() {
    this.wb = new ExcelJS.Workbook();
    this._addWorksheets();
    this._fillHeaders();
  }

  writeRow(values) {
    let row = this.batteryWs.addRow(
      values.slice(0, STORED_VALUES.numOfBatteryValues + 1)
    );
    this._stylizeRow(row);
    row = this.FCws.addRow(
      [values[0]].concat(values.slice(STORED_VALUES.numOfBatteryValues + 1))
    );
    this._stylizeRow(row);
  }

  saveLog(dir = 'E:', cb = Function.prototype) {
    this.wb.xlsx
      .writeBuffer()
      .then((blob) => writeFile(path.join(dir, 'CarLog.xlsx'), blob, cb));
  }

  _stylizeRow(row) {
    row.border = this._thinBorder;
    row.alignment = { horizontal: 'right' };
  }

  _stylizeHeader(row) {
    row.font = { bold: true, color: { argb: 'ffffffff' } };
    row.border = this._thinBorder;
    row.alignment = { wrapText: true };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ff8bc041' },
    };
  }

  _addWorksheets() {
    this.batteryWs = this.wb.addWorksheet(__('battery'));
    this.FCws = this.wb.addWorksheet(__('fuel cell'));
  }

  _fillHeaders() {
    this.batteryWs.columns = this._getHeaders(BATTERY_CHARACTERISTICS).map(
      (header) => ({
        header,
        width: Math.max(16, Math.floor(header.length / 2) + 2),
      })
    );
    this._stylizeHeader(this.batteryWs.getRow(1));
    this.FCws.columns = this._getHeaders(FUEL_CELL_CHARACTERISTICS).map(
      (header) => ({
        header,
        width: Math.max(16, Math.floor(header.length / 2) + 2),
      })
    );
    this._stylizeHeader(this.FCws.getRow(1));
  }

  _getHeaders(entries) {
    const headers = [__('t, s')];
    for (const key in entries) {
      if (STORED_VALUES.includes(key)) {
        const { label, units } = entries[key];
        headers.push(`${label}, ${units}`);
      }
    }
    return headers;
  }
}

module.exports = XLSLogger;
