import axios from "axios";
import { Event } from "../models";

export const logEvent = async (event: Event): Promise<void> => {
  await axios.post(
    `${process.env.FLYREEL_API_BASE_URL}/v1/inspections/${event.inspection}/event`,
    event,
    {
      headers: {
        Authorization: `Bearer ${process.env.FLYREEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
};
