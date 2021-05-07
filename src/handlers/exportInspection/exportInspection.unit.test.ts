// import { axiosMock, slackMock } from "../../../__mocks__";
// import { res, req } from "../../../setupUnitTests";
// import { getToken } from "../../utils/corelogic.util";
// import { logEvent } from "../../utils/flyreel.util";

import { full_inspection } from "../../../factories/inspection.factory";
import { transformInspectionData } from "./exportHelpers";

describe("transformInspectionData", () => {
  it("should return formatted inspection data (form, photos, videos)", () => {
    const {
      formUpload,
      photoMessages,
      videoMessages,
    } = transformInspectionData({ ...full_inspection });

    const formData = {
      Field: [
        {
          Name: "Bathroom10_BathroomSCountertopsTypes",
          Value: JSON.stringify(["Laminate", "Butcher Block", "Granite"]),
        },
        {
          Name: "Bathroom10_BathroomSFloor",
          Value: JSON.stringify("Laminate"),
        },
        {
          Name: "Bathroom10_Bathroom1SLocation",
          Value: JSON.stringify("715 S York St, Denver, CO 80209, USA"),
        },
      ],
      InspectionId: full_inspection._id,
      UniqueId: full_inspection.meta.external_id,
    };

    expect(formUpload).toEqual(formData);
    expect(photoMessages).toEqual([
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
    ]);
    expect(videoMessages).toEqual([
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
    ]);
  });

  it("should return empty string if answer value does not exist", () => {
    const { formUpload } = transformInspectionData({
      ...full_inspection,
      conversation: {
        _id: "6a23ff7264edba1ab4735k08",
        carrier: "5c59ff7264edba1ab4735b3c",
        name: "Residential Inspection",
        completed: true,
        modules: [
          {
            _id: "5d1b88ed82a672eb5aeb22a5",
            carrier: "5c59ff7264edba1ab4735b3c",
            name: "Bathroom - 1",
            completed: true,
            messages: [
              {
                _id: "5db214dba21a590011bd751d",
                carrier: "5c59ff7264edba1ab4735b3c",
                name: "Bathroom's countertops types",
                text: "What type of countertops do you have?",
                dashboard_text: "Type of countertops",
                show_in_dashboard: true,
                type: "select_multiple",
                options: ["Laminate", "Butcher Block", "Granite"],
                answer_time: "2019-02-05T21:26:10.372Z",
                completed: true,
                deleted: false,
              },
            ],
          },
        ],
      },
    });

    const formData = {
      Field: [
        {
          Name: "Bathroom10_BathroomSCountertopsTypes",
          Value: JSON.stringify(""),
        },
      ],
      InspectionId: full_inspection._id,
      UniqueId: full_inspection.meta.external_id,
    };

    expect(formUpload).toEqual(formData);
  });
});
