export const slackMock = {
  send: jest.fn(),
};

export const IncomingWebhook = jest.fn().mockImplementation(() => slackMock);
