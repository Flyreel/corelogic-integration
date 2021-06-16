import { axiosMock, logMock, slackMock } from "../../../__mocks__";
import { res, req } from "../../../setupUnitTests";
import { createInspection } from "../../../factories/inspection.factory";
import { notifyCancellation } from ".";
import { getToken } from "../../utils/corelogic.util";
import { logEvent } from "../../utils/flyreel.util";

const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

jest.mock("../../utils/corelogic.util");
jest.mock("../../utils/flyreel.util");

describe("notifyCancellation", () => {
  let inspection: any;

  beforeEach(async () => {
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

    Object.assign(req, { body: { current: inspection } });

    await notifyCancellation(req, res);
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
    expect(logMock.info).toHaveBeenCalledTimes(1);
    expect(logMock.info).toHaveBeenCalledWith(
      `Successfully sent cancellation notification for inspection ${inspection._id}: \"notification response\"`
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith("notification response");
    expect(slackMock.send).toHaveBeenCalledTimes(0);
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith({
      inspection: inspection._id,
      event: "sent_corelogic_inspection_cancellation_notification",
      meta: { external_id: inspection.meta.external_id },
    });
  });

  it("should return 400 and not send cancellation notification when external_id is missing", async () => {
    axiosMock.get = jest.fn();
    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, {
      body: { current: { ...inspection, meta: {} } },
    });

    await notifyCancellation(req, res);
    expect(getToken).toHaveBeenCalledTimes(0);
    expect(axiosMock.get).toHaveBeenCalledTimes(0);

    expect(logMock.error).toHaveBeenCalledTimes(1);
    expect(logMock.error).toHaveBeenCalledWith(
      `Error in sending cancellation notification for inspection ${inspection._id}`,
      new Error("Missing required field external_id")
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
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
            text: `:epic_fail: Error in sending cancellation notification for inspection ${inspection._id}. \`\`\`Missing required field external_id\`\`\``,
          },
        },
      ],
    });
  });

  it("should return 500 when there is exception in sending notification", async () => {
    const error = new Error();
    axiosMock.get = jest.fn().mockRejectedValueOnce(error);
    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, { body: { current: inspection } });

    await notifyCancellation(req, res);
    expect(getToken).toHaveBeenCalledTimes(1);

    expect(logMock.error).toHaveBeenCalledTimes(1);
    expect(logMock.error).toHaveBeenCalledWith(
      `Error in sending cancellation notification for inspection ${inspection._id}`,
      error
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(error);
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error Sending Cancellation Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error in sending cancellation notification for inspection ${inspection._id}. \`\`\`\`\`\``,
          },
        },
      ],
    });
  });

  it("should return 500 when there is exception in logging event", async () => {
    const error = { response: { data: { message: "Log event error" } } };
    (logEvent as jest.Mock).mockRejectedValueOnce(error);
    (getToken as jest.Mock).mockResolvedValue("token");
    axiosMock.get = jest
      .fn()
      .mockResolvedValueOnce({ data: "notification response" });

    Object.assign(req, { body: { current: inspection } });

    await notifyCancellation(req, res);

    expect(getToken).toHaveBeenCalledTimes(1);
    expect(logMock.error).toHaveBeenCalledTimes(1);
    expect(logMock.error).toHaveBeenCalledWith(
      `Error in sending cancellation notification for inspection ${inspection._id}`,
      error
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(error);
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error Sending Cancellation Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error in sending cancellation notification for inspection ${inspection._id}. \`\`\`${error.response.data.message}\`\`\``,
          },
        },
      ],
    });
  });
});
