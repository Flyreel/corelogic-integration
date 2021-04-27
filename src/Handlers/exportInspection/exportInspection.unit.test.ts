import { full_inspection } from "../../../factories/inspection.factory";
import {
  transformFormData,
  transformPhotos,
  transformVideos,
} from "./exportHelpers";

jest.mock("../../utils/corelogic.util");
jest.mock("../../utils/flyreel.util");

describe("exportHelpers", () => {
  it("should return formatted form data excluding photos and videos", async () => {
    const formData = transformFormData(full_inspection);
    const formattedData = {
      InspectionId: full_inspection._id,
      UniqueId: full_inspection.meta.external_id,
      Field: [
        {
          Name: "Countertops",
          Value: "Butcher Block",
        },
        {
          Name: "Countertops",
          Value: "Laminate",
        },
      ],
    };
    expect(formData).toStrictEqual(formattedData);
  });

  it("should return a list of photos to be exported without duplicates", async () => {
    const photos = transformPhotos(full_inspection);

    const exportedPhotos = {
      Bathroom: ["detection_url1.jpg", "detection_url2.jpg"],
      LivingRoom: ["http://image_url.com"],
      Kitchen: ["kitchen_detection_url1.jpg", "kitchen_detection_url2.jpg"],
    };

    expect(photos).toMatchObject(exportedPhotos);
  });

  it("should return a list of videos to be exported without duplicates", async () => {
    const videos = transformVideos(full_inspection);

    const exportedVideos = {
      Bathroom: "http://image_url.com",
      Kitchen: "http://kitchen_video.com",
    };
    expect(videos).toMatchObject(exportedVideos);
  });
});
