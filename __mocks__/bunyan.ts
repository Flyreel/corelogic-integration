export const logMock = {
  createLogger: jest.fn().mockReturnThis(),
  level: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

export default logMock;
