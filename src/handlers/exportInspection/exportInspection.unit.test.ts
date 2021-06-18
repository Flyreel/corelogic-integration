import FormData from "form-data";
import {
  transformInspectionData,
  createFormData,
  sendPhoto,
  sendVideo,
} from "./exportHelpers";
import { axiosMock, logMock, slackMock } from "../../../__mocks__";
import { res, req } from "../../../setupUnitTests";
import {
  createInspection,
  full_inspection,
} from "../../../factories/inspection.factory";
import { exportInspection } from "./exportInspection";
import { getToken } from "../../utils/corelogic.util";
import { logEvent } from "../../utils/flyreel.util";

jest.mock("../../utils/corelogic.util");
jest.mock("../../utils/flyreel.util");
jest.mock("./exportHelpers.ts");

const flyreelApiUrl = process.env.FLYREEL_API_BASE_URL as string;
const flyreelToken = process.env.FLYREEL_API_TOKEN as string;
export const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
export const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
export const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

describe("exportInspection", () => {
  let inspection: any;

  const photoMessages = [
    {
      _id: "5db214dba21a590011bd751c",
      carrier: "5c59ff7264edba1ab4735b3c",
      name: "Living Room",
      text: "Take a picture of your living room",
      dashboard_text: "Living Room Picture",
      show_in_dashboard: true,
      type: "photo",
      options: {
        cv_endpoint: "http://mycvendpoint.com",
      },
      answer:
        "https://storage.googleapis.com/flyreel-media-2020/5cf977ec4271180014099982/607da947c7a186000e3aa300/sm-6bcf1c8d-645b-4b0a-9a52-98d4b6a3c884.png?Expires=2524608000&GoogleAccessId=ai-851%40flyreel-infrastructure.iam.gserviceaccount.com&Signature=MHo0HVifgCW8IqDtpRfUX0QjPqOolln7vOJGTyBl7pK%2BbKwRjZt%2FYSW%2FbOG%2BC3du9NPP5HvcsAQjtzkFkWPAyZHO0w7MzlZaAcnjLSCsnKA3j6gDTvoGg%2BLd1JB0hv0MKN%2FJOLG%2ByqzXr2UGlFkYUz5oea2VjKSHky86IteFNt%2Fdy1c33BNYS8l2cv52vmyRjCcfbsOW0cuLGzpWmAY9fXkr65SrIHgnxW9%2BZQyOBhhNd86Qt4xrxK%2F5NHUAFxx751CxnOEO6qdSeYa9ltdFj7CGxWMH8LEfuDp73FbLZFhDtlRRimtCAXR%2FqlbhkOUMP8XBuN2Hi%2BYdVKA8S%2F%2BPcQ%3D%3D",
      answer_time: "2019-02-05T21:27:10.372Z",
      completed: true,
      deleted: false,
      createdAt: new Date("2019-02-05T21:26:10.372Z"),
      updatedAt: new Date("2019-02-05T21:26:10.372Z"),
      isNew: true,
      __v: 0,
    },
  ];
  const videoMessages = [
    {
      _id: "5d1b8916040863a658d77482",
      carrier: "5c59ff7264edba1ab4735b3c",
      name: "Bathroom's floor",
      text: "Take a video of your bathroom",
      dashboard_text: "Bathroom Video",
      show_in_dashboard: true,
      type: "video",
      options: {
        cv_endpoint: "http://mycvendpoint.com",
      },
      answer:
        "https://flyreel.blob.core.windows.net/mobile-upload/21cb1c22-05db-4ec2-a5da-3c940d200354.mov",
      answer_time: "2019-02-05T21:28:10.372Z",
      completed: true,
      deleted: false,
      createdAt: new Date("2019-02-05T21:26:10.372Z"),
      updatedAt: new Date("2019-02-05T21:26:10.372Z"),
      isNew: true,
      detections: [
        {
          misdetection: {
            misdetected: false,
            new_detection: null,
          },
          deleted: false,
          _id: "5d50adb612d1da0011f1f18c",
          message: "5d1b8916040863a658d77482",
          media_source:
            "https://flyreel.blob.core.windows.net/mobile-upload/5cf977ec4271180014099982/5c7a634c-91b3-403a-b43b-61bcae070e29.mov",
          thumb_url:
            "https://storage.googleapis.com/flyreel-media-2020/5cf977ec4271180014077782/607da947c7a186000e3aa300/sm-6bcf1c8d-645b-4b0a-9a52-98d4b6a3c884.png?Expires=2524608000&GoogleAccessId=ai-851%40flyreel-infrastructure.iam.gserviceaccount.com&Signature=MHo0HVifgCW8IqDtpRfUX0QjPqOolln7vOJGTyBl7pK%2BbKwRjZt%2FYSW%2FbOG%2BC3du9NPP5HvcsAQjtzkFkWPAyZHO0w7MzlZaAcnjLSCsnKA3j6gDTvoGg%2BLd1JB0hv0MKN%2FJOLG%2ByqzXr2UGlFkYUz5oea2VjKSHky86IteFNt%2Fdy1c33BNYS8l2cv52vmyRjCcfbsOW0cuLGzpWmAY9fXkr65SrIHgnxW9%2BZQyOBhhNd86Qt4xrxK%2F5NHUAFxx751CxnOEO6qdSeYa9ltdFj7CGxWMH8LEfuDp73FbLZFhDtlRRimtCAXR%2FqlbhkOUMP8XBuN2Hi%2BYdVKA8S%2F%2BPcQ%3D%3D",
          detections: [
            {
              bbox: [76, 81, 110, 119],
              class: "hot tub",
              score: 0.996041977040924,
            },
          ],
          time: 3.00167,
          inspection: "5d434893151c6d00128b8c59",
          module: "5d43204dcc08f20012199451",
        },
      ],
      __v: 0,
    },
  ];

  beforeEach(() => {
    inspection = createInspection();
  });

  it("should send inspection", async () => {
    const formUpload = {
      Field: [],
      InspectionId: full_inspection._id,
      UniqueId: inspection.meta.external_id,
    };

    (getToken as jest.Mock).mockResolvedValue("token");
    (transformInspectionData as jest.Mock).mockReturnValueOnce({
      formUpload,
      photoMessages,
      videoMessages,
    });
    (createFormData as jest.Mock).mockResolvedValue(new FormData());

    Object.assign(req, {
      body: { current: { ...inspection, _id: full_inspection._id } },
    });

    axiosMock.get = jest
      .fn()
      .mockResolvedValueOnce(full_inspection)
      .mockResolvedValueOnce({ data: {} });
    axiosMock.post = jest.fn().mockReturnValueOnce({});

    await exportInspection(req, res);

    expect(getToken).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledTimes(2);
    expect(axiosMock.get).toHaveBeenNthCalledWith(
      1,
      `${flyreelApiUrl}/v2/inspections/${full_inspection._id}`,
      {
        headers: {
          Authorization: `Bearer ${flyreelToken}`,
        },
      }
    );
    expect(axiosMock.get).toHaveBeenNthCalledWith(
      2,
      `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${inspection.meta.external_id}&UniqueId=${full_inspection._id}&Action=Complete`,
      {
        headers: {
          Authorization: `Bearer token`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      }
    );

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(
      `${corelogicApiUrl}/api/digitalhub/v1/Form/Upload`,
      formUpload,
      {
        headers: {
          Authorization: `Bearer token`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      }
    );
    expect(logMock.info).toHaveBeenCalledTimes(4);
    expect(sendPhoto).toHaveBeenCalledTimes(2);
    expect(sendPhoto).toHaveBeenNthCalledWith(1, {
      coreLogicToken: "token",
      photoForm: expect.any(Object),
      photoUrl: photoMessages[0].answer,
      inspectionId: full_inspection._id,
    });
    expect(sendPhoto).toHaveBeenNthCalledWith(2, {
      coreLogicToken: "token",
      photoForm: expect.any(Object),
      photoUrl: videoMessages[0].detections[0].thumb_url,
      inspectionId: full_inspection._id,
    });
    expect(sendVideo).toHaveBeenCalledTimes(videoMessages.length);
    expect(sendVideo).toHaveBeenCalledWith({
      coreLogicToken: "token",
      videoForm: expect.any(Object),
      videoUrl: videoMessages[0].answer,
      inspectionId: full_inspection._id,
    });
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith({
      inspection: full_inspection._id,
      event: "inspection_data_sent_to_corelogic",
      meta: { external_id: inspection.meta.external_id },
    });
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({});
    expect(slackMock.send).toHaveBeenCalledTimes(0);
  });

  it("should throw error when external ID does not exist", async () => {
    const error = new Error(`Missing required field external_id`);
    Object.assign(req, {
      body: { current: { ...inspection, _id: full_inspection._id, meta: {} } },
    });

    await exportInspection(req, res);
    expect(axiosMock.get).not.toHaveBeenCalled();
    expect(getToken).not.toHaveBeenCalled();
    expect(sendVideo).not.toHaveBeenCalled();
    expect(sendPhoto).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();
    expect(logMock.error).toHaveBeenCalledTimes(1);
    expect(logMock.error).toHaveBeenCalledWith(
      "Error in sending data to CoreLogic for inspection 8d59ff7264edba1ab4735b42",
      new Error("Missing required field external_id")
    );
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error exporting inspection`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error to export inspection ${full_inspection._id} to CoreLogic. \`\`\`${error.message}\`\`\``,
          },
        },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(error);
  });

  it("should should stop if failed to send form data and notify on slack", async () => {
    const formUpload = {
      Field: [],
      InspectionId: full_inspection._id,
      UniqueId: inspection.meta.external_id,
    };

    (getToken as jest.Mock).mockResolvedValue("token");
    (transformInspectionData as jest.Mock).mockReturnValueOnce({
      formUpload,
      photoMessages,
      videoMessages,
    });

    Object.assign(req, {
      body: { current: { ...inspection, _id: full_inspection._id } },
    });

    axiosMock.get = jest.fn().mockResolvedValueOnce(full_inspection);
    axiosMock.post = jest.fn().mockRejectedValueOnce({
      response: { data: { message: "fake error message" } },
    });

    await exportInspection(req, res);

    expect(getToken).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith(
      `${flyreelApiUrl}/v2/inspections/${full_inspection._id}`,
      {
        headers: {
          Authorization: `Bearer ${flyreelToken}`,
        },
      }
    );

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(
      `${corelogicApiUrl}/api/digitalhub/v1/Form/Upload`,
      formUpload,
      {
        headers: {
          Authorization: `Bearer token`,
          "Content-Type": "application/json",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
        },
      }
    );
    expect(logMock.info).not.toHaveBeenCalled();
    expect(sendVideo).not.toHaveBeenCalled();
    expect(sendPhoto).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();
    const error = {
      response: { data: { message: "fake error message" } },
    } as any;
    expect(logMock.error).toHaveBeenCalledTimes(1);
    expect(logMock.error).toHaveBeenCalledWith(
      "Error in sending data to CoreLogic for inspection 8d59ff7264edba1ab4735b42",
      error
    );
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error exporting inspection`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error to export inspection ${
              full_inspection._id
            } to CoreLogic. \`\`\`${
              error.response?.data?.message ?? error.message
            }\`\`\``,
          },
        },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(error);
  });

  it("should should stop at first error if failed to send photo and notify on slack", async () => {
    const formUpload = {
      Field: [],
      InspectionId: full_inspection._id,
      UniqueId: inspection.meta.external_id,
    };

    (getToken as jest.Mock).mockResolvedValue("token");
    (transformInspectionData as jest.Mock).mockReturnValueOnce({
      formUpload,
      photoMessages,
      videoMessages,
    });

    const error = new Error("First photo error") as any;
    (sendPhoto as jest.Mock)
      .mockImplementationOnce(() => {
        throw error;
      })
      .mockReturnValue(new FormData());

    Object.assign(req, {
      body: { current: { ...inspection, _id: full_inspection._id } },
    });

    axiosMock.get = jest.fn().mockResolvedValueOnce(full_inspection);
    axiosMock.post = jest.fn().mockResolvedValueOnce(full_inspection);

    await exportInspection(req, res);

    expect(getToken).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith(
      `${flyreelApiUrl}/v2/inspections/${full_inspection._id}`,
      {
        headers: {
          Authorization: `Bearer ${flyreelToken}`,
        },
      }
    );

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(
      `${corelogicApiUrl}/api/digitalhub/v1/Form/Upload`,
      formUpload,
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
    expect(sendPhoto).toHaveBeenCalledTimes(1);
    expect(sendVideo).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();

    expect(logMock.error).toHaveBeenCalledTimes(1);
    expect(logMock.error).toHaveBeenCalledWith(
      "Error in sending data to CoreLogic for inspection 8d59ff7264edba1ab4735b42",
      error
    );
    expect(slackMock.send).toHaveBeenCalledTimes(1);
    expect(slackMock.send).toHaveBeenCalledWith({
      username: `CoreLogic: Error exporting inspection`,
      icon_emoji: ":facepalm:",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:epic_fail: Error to export inspection ${
              full_inspection._id
            } to CoreLogic. \`\`\`${
              error.response?.data?.message ?? error.message
            }\`\`\``,
          },
        },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(error);
  });
});
