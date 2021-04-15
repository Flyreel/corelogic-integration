/* eslint-disable no-console */
import { axiosMock, slackMock } from "../../../__mocks__";
import { res, req } from "../../../setupUnitTests";
import { createInspection } from "../../../factories/inspection.factory";
import * as cancellationNotification from ".";
import { getToken } from "../../utils/corelogic.util";

const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

jest.mock("../../utils/corelogic.util");

describe("notifyCancellation", () => {
  let inspection: any;

  beforeEach(async () => {
    jest.spyOn(global.console, "log");
    jest.spyOn(global.console, "error");

    inspection = {
      ...(await createInspection({})),
      _id: "5f46b26d7c186f001f11808a",
      meta: {
        external_id: "0022f699-74c7-411c-91c6-c39cc10f56a1+1983545",
      },
    };
  });

  it("should return 200 and send cancellation notification", async () => {
    axiosMock.get = jest
      .fn()
      .mockResolvedValueOnce({ data: "notification response" });

    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, { body: { current: JSON.stringify(inspection) } });

    await cancellationNotification.notifyCancellation(req, res);
    expect(getToken).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith(
      `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${inspection.meta.external_id}&UniqueId=${inspection._id}&Action=Cancel`,
      {
        headers: {
          Authorization: `Bearer token`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      }
    );
    expect(global.console.log).toHaveBeenCalledTimes(1);
    expect(global.console.log).toHaveBeenCalledWith(
      `Successfully sent cancellation notification for inspection ${inspection._id}`
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ data: "notification response" });
    expect(slackMock.send).not.toHaveBeenCalled();
  });

  it("should return 500 and not send cancellation notification when external_id is missing", async () => {
    axiosMock.get = jest.fn();
    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, {
      body: { current: JSON.stringify({ ...inspection, meta: {} }) },
    });

    await cancellationNotification.notifyCancellation(req, res);
    expect(getToken).not.toHaveBeenCalled();
    expect(axiosMock.get).not.toHaveBeenCalled();

    expect(global.console.error).toHaveBeenCalledTimes(1);
    expect(global.console.error).toHaveBeenCalledWith(
      `Failed to send cancellation notification for inspection ${inspection._id} of carrier ${inspection.carrier._id}`,
      new Error("Missing required field external_id")
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(
      new Error(`Missing required field external_id`)
    );
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error Sending Cancellation Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Failed to send cancellation notification for inspection ${inspection._id} of carrier ${inspection.carrier.name}. \`\`\`Missing required field external_id\`\`\``,
          },
        },
      ],
    });
  });

  it("should return 500 when there is exception", async () => {
    const error = new Error();
    axiosMock.get = jest.fn().mockRejectedValueOnce(error);
    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, { body: { current: JSON.stringify(inspection) } });

    await cancellationNotification.notifyCancellation(req, res);
    expect(getToken).toHaveBeenCalledTimes(1);

    expect(global.console.error).toHaveBeenCalledTimes(1);
    expect(global.console.error).toHaveBeenCalledWith(
      `Failed to send cancellation notification for inspection ${inspection._id} of carrier ${inspection.carrier._id}`,
      error
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(error);
  });
});
