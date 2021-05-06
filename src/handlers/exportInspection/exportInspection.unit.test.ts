import { full_inspection } from "../../../factories/inspection.factory";
import { transformInspectionData } from "./exportHelpers";

describe("exportHelpers", () => {
  it("should return formatted inspection data (form, photos, videos)", () => {
    const { formUpload, photos, videos } = transformInspectionData(
      full_inspection
    );

    const formData = {
      Field: [
        {
          Name: "ResidentialInspection0_Countertops",
          Value: JSON.stringify("Laminate"),
        },
      ],
      InspectionId: full_inspection._id,
      UniqueId: full_inspection.meta.external_id,
    };
    const photoData = {
      [`sm-6bcf1c8d-645b-4b0a-9a52-98d4b6a3c884.png`]: expect.any(Object),
    };
    const videoData = {
      [`21cb1c22-05db-4ec2-a5da-3c940d200354.mov`]: expect.any(Object),
    };

    expect(formUpload).toEqual(formData);
    expect(photos).toEqual(photoData);
    expect(videos).toEqual(videoData);
  });
});
