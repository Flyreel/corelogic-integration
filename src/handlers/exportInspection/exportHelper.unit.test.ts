import FormData from "form-data";
import mock from "mock-fs";
import { full_inspection } from "../../../factories/inspection.factory";
import {
  transformInspectionData,
  createFormData,
  sendPhoto,
  sendVideo,
} from "./exportHelpers";
import { axiosMock, logMock } from "../../../__mocks__";

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
          Name: "Bathroom11_BathroomSCountertopsTypes",
          Value: JSON.stringify(["Laminate", "Butcher Block", "Granite"]),
        },
        {
          Name: "Bathroom10_BathroomSFloor",
          Value: "Laminate",
        },
        {
          Name: "Bathroom10_Bathroom1SLocation",
          Value: "715 S York St, Denver, CO 80209, USA",
        },
      ],
      InspectionId: full_inspection.meta.external_id,
      UniqueId: full_inspection._id,
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
      InspectionId: full_inspection.meta.external_id,
      UniqueId: full_inspection._id,
    };

    expect(formUpload).toEqual(formData);
  });

  it("should return remove emoji from answer", () => {
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
                text:
                  "What type of 😀countertops😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🥸🤩🥳😏😒 do you have?",
                answer:
                  "Stone😀 countertops😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🥸🤩🥳😏😒",
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
          Value: "Stone countertops",
        },
      ],
      InspectionId: full_inspection.meta.external_id,
      UniqueId: full_inspection._id,
    };

    expect(formUpload).toEqual(formData);
  });

  it("should throw error if conversation does not exist", () => {
    expect(() =>
      transformInspectionData({
        ...full_inspection,
        conversation: null,
      })
    ).toThrow("Missing required conversation");
  });
});

describe("createFormData", () => {
  afterEach(mock.restore);

  it("should create formData", async () => {
    const message = {
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
        "https://storage.googleapis.com/flyreel-media-2020/5cf977ec4271180014099982/607da947c7a186000e3aa300/sm-6bcf1c8d-645b-4b0a-9a52-98d4b6a3c884.jpg?Expires=2524608000&GoogleAccessId=ai-851%40flyreel-infrastructure.iam.gserviceaccount.com&Signature=MHo0HVifgCW8IqDtpRfUX0QjPqOolln7vOJGTyBl7pK%2BbKwRjZt%2FYSW%2FbOG%2BC3du9NPP5HvcsAQjtzkFkWPAyZHO0w7MzlZaAcnjLSCsnKA3j6gDTvoGg%2BLd1JB0hv0MKN%2FJOLG%2ByqzXr2UGlFkYUz5oea2VjKSHky86IteFNt%2Fdy1c33BNYS8l2cv52vmyRjCcfbsOW0cuLGzpWmAY9fXkr65SrIHgnxW9%2BZQyOBhhNd86Qt4xrxK%2F5NHUAFxx751CxnOEO6qdSeYa9ltdFj7CGxWMH8LEfuDp73FbLZFhDtlRRimtCAXR%2FqlbhkOUMP8XBuN2Hi%2BYdVKA8S%2F%2BPcQ%3D%3D",
      answer_time: "2019-02-05T21:27:10.372Z",
      completed: true,
      deleted: false,
      createdAt: new Date("2019-02-05T21:26:10.372Z"),
      updatedAt: new Date("2019-02-05T21:26:10.372Z"),
      isNew: true,
      __v: 0,
    };
    mock({
      [message.answer]: "This is a photo",
    });

    axiosMock.get = jest.fn().mockResolvedValueOnce({ data: "stream data" });
    const inspectionId = "8d59ff7264edba1ab4735b42";
    const formData = await createFormData({
      messageType: message.type,
      fileUrl: message.answer,
      inspectionId,
      externalId: "external_inspection_id",
    });
    expect(formData).toBeInstanceOf(FormData);
    expect(
      formData?.getHeaders()["content-type"]?.startsWith("multipart/form-data")
    ).toBeTruthy();
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
    expect(axiosMock.get).toHaveBeenCalledWith(message.answer, {
      responseType: "stream",
    });
  });

  it("should return undefined with invalid photo file type", async () => {
    const message = {
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
    };

    const inspectionId = "8d59ff7264edba1ab4735b42";
    const formData = await createFormData({
      messageType: message.type,
      fileUrl: message.answer,
      inspectionId,
      externalId: "external_inspection_id",
    });

    expect(formData).toEqual(undefined);
    expect(logMock.warn).toHaveBeenCalledTimes(1);
    expect(logMock.warn).toHaveBeenCalledWith(
      `${message.answer} is an invalid ${message.type} type for inspection ${inspectionId}`
    );
    expect(axiosMock.get).not.toHaveBeenCalled();
  });

  it("should return undefined with invalid video file type", async () => {
    const message = {
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
        "https://storage.googleapis.com/flyreel-media-2020/5cf977ec4271180014099982/607da947c7a186000e3aa300/sm-6bcf1c8d-645b-4b0a-9a52-98d4b6a3c884.wov?Expires=2524608000&GoogleAccessId=ai-851%40flyreel-infrastructure.iam.gserviceaccount.com&Signature=MHo0HVifgCW8IqDtpRfUX0QjPqOolln7vOJGTyBl7pK%2BbKwRjZt%2FYSW%2FbOG%2BC3du9NPP5HvcsAQjtzkFkWPAyZHO0w7MzlZaAcnjLSCsnKA3j6gDTvoGg%2BLd1JB0hv0MKN%2FJOLG%2ByqzXr2UGlFkYUz5oea2VjKSHky86IteFNt%2Fdy1c33BNYS8l2cv52vmyRjCcfbsOW0cuLGzpWmAY9fXkr65SrIHgnxW9%2BZQyOBhhNd86Qt4xrxK%2F5NHUAFxx751CxnOEO6qdSeYa9ltdFj7CGxWMH8LEfuDp73FbLZFhDtlRRimtCAXR%2FqlbhkOUMP8XBuN2Hi%2BYdVKA8S%2F%2BPcQ%3D%3D",
      answer_time: "2019-02-05T21:27:10.372Z",
      completed: true,
      deleted: false,
      createdAt: new Date("2019-02-05T21:26:10.372Z"),
      updatedAt: new Date("2019-02-05T21:26:10.372Z"),
      isNew: true,
      __v: 0,
    };

    const formData = await createFormData({
      messageType: message.type,
      fileUrl: message.answer,
      inspectionId: "8d59ff7264edba1ab4735b42",
      externalId: "external_inspection_id",
    });
    expect(formData).toEqual(undefined);
    expect(logMock.warn).toHaveBeenCalledTimes(1);
    expect(logMock.warn).toHaveBeenCalledWith(
      `${message.answer} is an invalid ${message.type} type for inspection 8d59ff7264edba1ab4735b42`
    );
    expect(axiosMock.get).not.toHaveBeenCalled();
  });

  it("should return undefined if file path is missing", async () => {
    const message = {
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
      answer_time: "2019-02-05T21:27:10.372Z",
      completed: true,
      deleted: false,
      createdAt: new Date("2019-02-05T21:26:10.372Z"),
      updatedAt: new Date("2019-02-05T21:26:10.372Z"),
      isNew: true,
      __v: 0,
    };

    const formData = await createFormData({
      messageType: message.type,
      fileUrl: "",
      inspectionId: "8d59ff7264edba1ab4735b42",
      externalId: "external_inspection_id",
    });
    expect(formData).toEqual(undefined);
    expect(logMock.warn).toHaveBeenCalledTimes(1);
    expect(logMock.warn).toHaveBeenCalledWith(
      ` is an invalid ${message.type} type for inspection 8d59ff7264edba1ab4735b42`
    );
    expect(axiosMock.get).not.toHaveBeenCalled();
  });
});

describe("sendPhoto", () => {
  const coreLogicToken = "token";
  const photoForm = new FormData();
  const photoUrl =
    "https://storage.googleapis.com/flyreel-media-2020/5cf977ec4271180014099982/607da947c7a186000e3aa300/sm-6bcf1c8d-645b-4b0a-9a52-98d4b6a3c884.jpg?Expires=2524608000&GoogleAccessId=ai-851%40flyreel-infrastructure.iam.gserviceaccount.com&Signature=MHo0HVifgCW8IqDtpRfUX0QjPqOolln7vOJGTyBl7pK%2BbKwRjZt%2FYSW%2FbOG%2BC3du9NPP5HvcsAQjtzkFkWPAyZHO0w7MzlZaAcnjLSCsnKA3j6gDTvoGg%2BLd1JB0hv0MKN%2FJOLG%2ByqzXr2UGlFkYUz5oea2VjKSHky86IteFNt%2Fdy1c33BNYS8l2cv52vmyRjCcfbsOW0cuLGzpWmAY9fXkr65SrIHgnxW9%2BZQyOBhhNd86Qt4xrxK%2F5NHUAFxx751CxnOEO6qdSeYa9ltdFj7CGxWMH8LEfuDp73FbLZFhDtlRRimtCAXR%2FqlbhkOUMP8XBuN2Hi%2BYdVKA8S%2F%2BPcQ%3D%3D";
  const inspectionId = "8d59ff7264edba1ab4735b42";

  const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
  const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
  const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

  it("should send photo", async () => {
    axiosMock.post = jest.fn().mockResolvedValueOnce({ data: {} });
    await sendPhoto({
      coreLogicToken,
      photoForm,
      photoUrl,
      inspectionId,
    });

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(
      `${corelogicApiUrl}/api/digitalhub/v1/Photo/Upload`,
      photoForm,
      {
        headers: {
          Authorization: `Bearer token`,
          "Content-Type": "application/multipart-formdata",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
          ...photoForm.getHeaders(),
        },
      }
    );
    expect(logMock.info).toHaveBeenCalledTimes(1);
    expect(logMock.info).toHaveBeenCalledWith(
      `Uploaded photo ${photoUrl} for inspection ${inspectionId}`
    );
  });

  it("should fail on first try and success on second try", async () => {
    axiosMock.post = jest
      .fn()
      .mockRejectedValueOnce({ error: {} })
      .mockResolvedValueOnce({ data: {} });

    await sendPhoto({
      coreLogicToken,
      photoForm,
      photoUrl,
      inspectionId,
    });

    expect(axiosMock.post).toHaveBeenCalledTimes(2);
    expect(logMock.info).toHaveBeenCalledTimes(1);
    expect(logMock.info).toHaveBeenCalledWith(
      `Uploaded photo ${photoUrl} for inspection ${inspectionId}`
    );
  });
});

describe("sendVideo", () => {
  const coreLogicToken = "token";
  const videoForm = new FormData();
  const videoUrl =
    "https://storage.googleapis.com/flyreel-media-2020/5cf977ec4271180014099982/607da947c7a186000e3aa300/sm-6bcf1c8d-645b-4b0a-9a52-98d4b6a3c884.mp4?Expires=2524608000&GoogleAccessId=ai-851%40flyreel-infrastructure.iam.gserviceaccount.com&Signature=MHo0HVifgCW8IqDtpRfUX0QjPqOolln7vOJGTyBl7pK%2BbKwRjZt%2FYSW%2FbOG%2BC3du9NPP5HvcsAQjtzkFkWPAyZHO0w7MzlZaAcnjLSCsnKA3j6gDTvoGg%2BLd1JB0hv0MKN%2FJOLG%2ByqzXr2UGlFkYUz5oea2VjKSHky86IteFNt%2Fdy1c33BNYS8l2cv52vmyRjCcfbsOW0cuLGzpWmAY9fXkr65SrIHgnxW9%2BZQyOBhhNd86Qt4xrxK%2F5NHUAFxx751CxnOEO6qdSeYa9ltdFj7CGxWMH8LEfuDp73FbLZFhDtlRRimtCAXR%2FqlbhkOUMP8XBuN2Hi%2BYdVKA8S%2F%2BPcQ%3D%3D";
  const inspectionId = "8d59ff7264edba1ab4735b42";

  const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
  const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
  const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;

  it("should send photo", async () => {
    axiosMock.post = jest.fn().mockResolvedValueOnce({ data: {} });
    await sendVideo({
      coreLogicToken,
      videoForm,
      videoUrl,
      inspectionId,
    });

    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(
      `${corelogicApiUrl}/api/digitalhub/v1/Video/Upload`,
      videoForm,
      {
        headers: {
          Authorization: `Bearer token`,
          "Content-Type": "application/multipart-formdata",
          "api-key": apiKey,
          "api-companyid": apiCompanyId,
          ...videoForm.getHeaders(),
        },
      }
    );
    expect(logMock.info).toHaveBeenCalledTimes(1);
    expect(logMock.info).toHaveBeenCalledWith(
      `Uploaded video ${videoUrl} for inspection ${inspectionId}`
    );
    expect(logMock.error).not.toHaveBeenCalled();
  });

  it("should fail on first try and succeed on second try", async () => {
    axiosMock.post = jest
      .fn()
      .mockRejectedValueOnce({ error: {} })
      .mockResolvedValueOnce({ data: {} });

    await sendVideo({
      coreLogicToken,
      videoForm,
      videoUrl,
      inspectionId,
    });

    expect(axiosMock.post).toHaveBeenCalledTimes(2);
    expect(logMock.info).toHaveBeenCalledTimes(1);
    expect(logMock.info).toHaveBeenCalledWith(
      `Uploaded video ${videoUrl} for inspection ${inspectionId}`
    );
    expect(logMock.error).toHaveBeenCalledTimes(1);
    expect(logMock.error).toHaveBeenCalledWith(
      `Failed to send video ${videoUrl} for inspection ${inspectionId} at retry #1`,
      {
        error: {},
      }
    );
  });
});
