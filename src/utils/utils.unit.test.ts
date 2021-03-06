/* eslint-disable no-console */
import { axiosMock } from "../../__mocks__";
import { getToken, logEvent } from ".";

describe("getToken", () => {
  const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
  const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
  const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;
  const username = process.env.CORELOGIC_DIGITALHUB_API_USERNAME as string;
  const password = process.env.CORELOGIC_DIGITALHUB_API_PASSWORD as string;

  it("should call login endpoint and return token", async () => {
    axiosMock.get = jest.fn().mockResolvedValueOnce({
      data: {
        tokenType: "Bearer Token",
        accessToken: "token",
        refreshToken: "refreshToken",
        expiresOn: "2021-04-11T15:17:49.5653326-05:00",
        message: null,
      },
    });

    const response = await getToken();
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith(`${corelogicApiUrl}/login`, {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "api-companyid": apiCompanyId,
      },
      auth: {
        username,
        password,
      },
    });
    expect(response).toEqual("token");
  });
});

describe("logEvent", () => {
  it("should call api", async () => {
    axiosMock.post = jest.fn();
    const event = {
      inspection: "5f9c62efa0db1340193277d8",
      event: "test_event",
    };

    await logEvent(event);

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(
      `${process.env.FLYREEL_API_BASE_URL}/v1/inspections/${event.inspection}/event`,
      event,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLYREEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  });
});
