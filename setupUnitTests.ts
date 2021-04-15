export const req: any = {};
export const res: any = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
  sendStatus: jest.fn(),
  attachment: jest.fn(),
  setHeader: jest.fn(),
  json: jest.fn(),
};

beforeEach(() => {
  const reqKeys = Object.keys(req);
  reqKeys.forEach((key) => delete req[`${key}`]);
});
