export const getInput = jest.fn();
export const getBooleanInput = jest.fn();
export const setFailed = jest.fn();
export const info = jest.fn();
export const setOutput = jest.fn();
export const warning = jest.fn();
export const error = jest.fn();
export const debug = jest.fn();
export const summary = {
  addRaw: jest.fn(),
  addTable: jest.fn(),
  addHeading: jest.fn(),
  addSeparator: jest.fn(),
  addBreak: jest.fn(),
  addList: jest.fn(),
  addLink: jest.fn(),
  addImage: jest.fn(),
  addQuote: jest.fn(),
  addCodeBlock: jest.fn(),
  addDetails: jest.fn(),
  addEOL: jest.fn(),
  stringify: jest.fn(),
  write: jest.fn(),
  clear: jest.fn(),
  isEmptyBuffer: jest.fn(),
  filePath: '',
  bufferSize: 0,
};
