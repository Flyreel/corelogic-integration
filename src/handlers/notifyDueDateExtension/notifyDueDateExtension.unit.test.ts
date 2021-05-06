/* eslint-disable no-console */
import dayjs from "dayjs";
import { axiosMock, slackMock } from "../../../__mocks__";
import { res, req } from "../../../setupUnitTests";
import { createInspection } from "../../../factories/inspection.factory";
import { notifyExtension, formatDueDate } from "./notifyDueDateExtension";
import { getToken } from "../../utils/corelogic.util";
import { logEvent } from "../../utils/flyreel.util";

const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

jest.mock("../../utils/corelogic.util");
jest.mock("../../utils/flyreel.util");

describe("notifyExtension", () => {
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

  it("should return 200 and send due date extension notification", async () => {
    (getToken as jest.Mock).mockResolvedValue("token");
    axiosMock.get = jest
      .fn()
      .mockResolvedValueOnce({ data: "notification response" });

    Object.assign(req, { body: { current: inspection } });

    await notifyExtension(req, res);

    expect(getToken).toHaveBeenCalledTimes(1);

    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith(
      `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${
        inspection.meta.external_id
      }&UniqueId=${inspection._id}&Action=Extend&DueDate=${formatDueDate(
        dayjs(inspection.expiration).toISOString()
      )}`,
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
      `Successfully sent due date extension notification for inspection ${inspection._id} with external_id ${inspection.meta.external_id}`
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({ data: "notification response" });
    expect(slackMock.send).toHaveBeenCalledTimes(0);
    expect(logEvent).toHaveBeenCalledWith({
      inspection: inspection._id,
      event: "sent_corelogic_inspection_extension_notification",
      meta: { external_id: inspection.meta.external_id },
    });
  });

  it("should return 400 and not send due date extension notification when external_id is missing", async () => {
    axiosMock.get = jest.fn();
    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, {
      body: { current: { ...inspection, meta: {} } },
    });

    await notifyExtension(req, res);
    expect(getToken).toHaveBeenCalledTimes(0);
    expect(axiosMock.get).toHaveBeenCalledTimes(0);

    expect(global.console.error).toHaveBeenCalledTimes(1);
    expect(global.console.error).toHaveBeenCalledWith(
      `Error in sending due date extension notification for inspection ${inspection._id} of carrier ${inspection.carrier._id}`,
      new Error("Missing required field(s) external_id")
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(
      new Error(`Missing required field(s) external_id`)
    );
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error Sending Due Date Extension Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error in sending due date extension notification for inspection ${inspection._id} of carrier ${inspection.carrier.name}. \`\`\`Missing required field(s) external_id\`\`\``,
          },
        },
      ],
    });
  });

  it("should return 400 and not send due date extension notification when expiration is missing", async () => {
    axiosMock.get = jest.fn();
    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, {
      body: {
        current: { ...inspection, expiration: undefined },
      },
    });

    await notifyExtension(req, res);
    expect(getToken).toHaveBeenCalledTimes(0);
    expect(axiosMock.get).toHaveBeenCalledTimes(0);

    expect(global.console.error).toHaveBeenCalledTimes(1);
    expect(global.console.error).toHaveBeenCalledWith(
      `Error in sending due date extension notification for inspection ${inspection._id} of carrier ${inspection.carrier._id}`,
      new Error("Missing required field(s) expiration")
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(
      new Error(`Missing required field(s) expiration`)
    );
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error Sending Due Date Extension Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error in sending due date extension notification for inspection ${inspection._id} of carrier ${inspection.carrier.name}. \`\`\`Missing required field(s) expiration\`\`\``,
          },
        },
      ],
    });
  });

  it("should return 400 and not send due date extension notification when both external_id and expiration are missing", async () => {
    axiosMock.get = jest.fn();
    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, {
      body: {
        current: { ...inspection, expiration: undefined, meta: {} },
      },
    });

    await notifyExtension(req, res);
    expect(getToken).toHaveBeenCalledTimes(0);
    expect(axiosMock.get).toHaveBeenCalledTimes(0);

    expect(global.console.error).toHaveBeenCalledTimes(1);
    expect(global.console.error).toHaveBeenCalledWith(
      `Error in sending due date extension notification for inspection ${inspection._id} of carrier ${inspection.carrier._id}`,
      new Error("Missing required field(s) external_id and expiration")
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(
      new Error(`Missing required field(s) external_id and expiration`)
    );
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error Sending Due Date Extension Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error in sending due date extension notification for inspection ${inspection._id} of carrier ${inspection.carrier.name}. \`\`\`Missing required field(s) external_id and expiration\`\`\``,
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

    await notifyExtension(req, res);
    expect(getToken).toHaveBeenCalledTimes(1);

    expect(global.console.error).toHaveBeenCalledTimes(1);
    expect(global.console.error).toHaveBeenCalledWith(
      `Error in sending due date extension notification for inspection ${inspection._id} of carrier ${inspection.carrier._id}`,
      error
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(error);
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error Sending Due Date Extension Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error in sending due date extension notification for inspection ${
              inspection._id
            } of carrier ${inspection.carrier.name}. \`\`\`${""}\`\`\``,
          },
        },
      ],
    });
  });

  it("should return 500 when there is exception in logging event", async () => {
    const error = { response: { data: { message: "Log event error" } } };
    (logEvent as jest.Mock).mockRejectedValueOnce(error);
    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, { body: { current: inspection } });

    await notifyExtension(req, res);
    expect(getToken).toHaveBeenCalledTimes(1);

    expect(global.console.error).toHaveBeenCalledTimes(1);
    expect(global.console.error).toHaveBeenCalledWith(
      `Error in sending due date extension notification for inspection ${inspection._id} of carrier ${inspection.carrier._id}`,
      error
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(error);
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error Sending Due Date Extension Notification`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error in sending due date extension notification for inspection ${inspection._id} of carrier ${inspection.carrier.name}. \`\`\`${error.response.data.message}\`\`\``,
          },
        },
      ],
    });
  });
});

describe("formatDueDate", () => {
  it("should return date string in mm/dd/yyyy format for single digit month and date", () => {
    const date = dayjs("2021-2-1").toISOString();
    const formatedDate = formatDueDate(date);
    expect(formatedDate).toEqual("02/01/2021");
  });

  it("should return date string in mm/dd/yyyy format for double digit month and date", () => {
    const date = dayjs("2020-10-11").toISOString();
    const formatedDate = formatDueDate(date);
    expect(formatedDate).toEqual("10/11/2020");
  });
});
