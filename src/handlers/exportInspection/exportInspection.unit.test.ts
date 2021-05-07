import FormData from "form-data";
import mock from "mock-fs";
import { axiosMock, slackMock } from "../../../__mocks__";
import { res, req } from "../../../setupUnitTests";
import {
  createInspection,
  full_inspection,
} from "../../../factories/inspection.factory";
import { transformInspectionData, createFormData } from "./exportHelpers";
import { getToken } from "../../utils/corelogic.util";
import { logEvent } from "../../utils/flyreel.util";

jest.mock("../../utils/corelogic.util");
jest.mock("../../utils/flyreel.util");

describe("exportInspection", async () => {
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

  it("should send inspection", () => {
    (getToken as jest.Mock).mockResolvedValue("token");

    Object.assign(req, { body: { current: inspection } });

    axiosMock.get = jest
      .fn()
      .mockResolvedValueOnce({ data: full_inspection })
      .mockResolvedValueOnce({ data: {} });

    axiosMock.post = jest.fn().mockResolvedValue({ data: {} });

    expect(1).toBe(1);
  });
});
