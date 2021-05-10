import { transformInspectionData } from "./exportHelpers";
import { axiosMock, slackMock } from "../../../__mocks__";
import { res, req } from "../../../setupUnitTests";
import { full_inspection } from "../../../factories/inspection.factory";
import { exportInspection } from "./exportInspection";
import { getToken } from "../../utils/corelogic.util";
import { logEvent } from "../../utils/flyreel.util";

jest.mock("../../utils/corelogic.util");
jest.mock("../../utils/flyreel.util");
jest.mock("../exportInspection/exportInspection.ts");

const flyreelApiUrl = process.env.FLYREEL_API as string;
const flyreelToken = process.env.FLYREEL_API_TOKEN as string;
export const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
export const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
export const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

describe("exportInspection", () => {
  let inspection: any;
  const formUpload = {
    Field: [],
    InspectionId: "8d59ff7264edba1ab4735b42",
    UniqueId: "external_inspection_id",
  };
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
    jest.spyOn(global.console, "log");
    jest.spyOn(global.console, "error");

    inspection = full_inspection;
  });

  it("should send inspection", async () => {
    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, { body: { current: inspection } });

    await exportInspection(req, res);
    expect(getToken).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith(
      `${flyreelApiUrl}/v1/inspections/${inspection._id}`,
      {
        headers: {
          Authorization: `Bearer token`,
        },
      }
    );
    (transformInspectionData as jest.Mock).mockResolvedValue({
      formUpload,
      photoMessages,
      videoMessages,
    });
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
    expect(global.console.log).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledTimes(photoMessages.length);
    expect(global.console.log).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledTimes(videoMessages.length);
    expect(axiosMock.post).toHaveBeenCalledTimes(
      videoMessages[0].detections.length
    );
    expect(global.console.log).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith(
      `${corelogicApiUrl}/api/digitalhub/v1/Action/State?InspectionId=${inspection.meta.externalId}&UniqueId=${inspection._id}&Action=Complete`,
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
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith({
      inspection: inspection._id,
      event: "inspection_data_sent_to_corelogic",
      meta: { external_id: inspection.meta.external_id },
    });
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(slackMock.send).toHaveBeenCalledTimes(0);
  });
});
