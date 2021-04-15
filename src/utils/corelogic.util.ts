import axios from "axios";

const corelogicApiUrl = process.env.CORELOGIC_DIGITALHUB_API as string;
const apiKey = process.env.CORELOGIC_DIGITALHUB_API_KEY as string;
const apiCompanyId = process.env.CORELOGIC_DIGITALHUB_API_COMPANY_ID;
const username = process.env.CORELOGIC_DIGITALHUB_API_USERNAME as string;
const password = process.env.CORELOGIC_DIGITALHUB_API_PASSWORD as string;

export const getToken = async (): Promise<string> => {
  const loginResponse = await axios.get(`${corelogicApiUrl}/login`, {
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      "api-companyid": apiCompanyId,
    },
    auth: {
      username,
      password,
    },
  });

  return loginResponse.data.accessToken;
};
