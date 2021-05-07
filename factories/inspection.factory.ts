export const createInspection = ({
  carrier = "5d3633fda9663d0011279333",
  custom_fields = {} as any,
  conversation = {} as any,
  policy_id = "5f9c62efa0db1340193777d7",
  policy_type = "new",
  first_name = "Test",
  last_name = "User",
  email = "support@flyreel.co",
  invalid_email = false,
  phone = "+13035551212",
  code = "1234567890",
  status = "pending",
  expiration = "2030-01-01 18:00:00.000Z",
  carrier_expiration = "2030-01-03 18:00:00.000Z",
  address1 = "3000 Lawrence St",
  address2 = undefined as string | undefined,
  city = "Denver",
  state = "CO",
  zip_code = "80205",
  country = "US" as "US" | "CA",
  location: {
    type = "Point" as const,
    coordinates = [39.761514, -104.979007],
  } = {},
  ordered_location: {
    type: ol_type = "Point" as const,
    coordinates: ol_coordinates = [39.761514, -104.979007],
  } = {},
  timezone: {
    dst_offset = 3600,
    raw_offset = -25200,
    timezone_id = "America/Denver",
    timezone_name = "Mountain Daylight Time",
  } = {},
  detected_address = "3000 Lawrence St, Denver, CO 80205",
  estated = undefined as any,
  agent_name = `Test Agent`,
  agent_email = "test.agent@flyreel.co",
  agent_phone = "+13035551212",
  reviewer = undefined as string | undefined,
  review_started = "2020-10-01:00:00.000+00:00",
  review_completed = "2020-10-01T00:00:00.000+00:00",
  flyreel_completed = false,
  flyreel_type = "inspection",
  contact_log = [] as any,
  last_contacted = "2020-10-01T00:00:00.000+00:00",
  meta: {
    external_id = "00107f7e-921f-41ce-98ee-d027ce6c9f8d" as string | undefined,
    forms: {
      self_inspection_form_id = undefined as string | undefined,
      self_inspection_internal_form = undefined as string | undefined,
    } = {},
    inspection_form_id = undefined as string | undefined,
    billing = undefined as any,
  } = {},
} = {}): any => {
  const inspection = {
    carrier,
    custom_fields,
    conversation,
    policy_id,
    policy_type,
    first_name,
    last_name,
    email,
    invalid_email,
    phone,
    code,
    status,
    expiration,
    carrier_expiration,
    address1,
    address2,
    city,
    state,
    zip_code,
    country,
    location: {
      type,
      coordinates,
    },
    ordered_location: {
      type: ol_type,
      coordinates: ol_coordinates,
    },
    timezone: {
      dst_offset,
      raw_offset,
      timezone_id,
      timezone_name,
    },
    detected_address,
    estated,
    agent_name,
    agent_email,
    agent_phone,
    reviewer,
    review_started,
    review_completed,
    flyreel_completed,
    flyreel_type,
    contact_log,
    last_contacted,
    meta: {
      external_id,
      forms: {
        self_inspection_form_id,
        self_inspection_internal_form,
      },
      inspection_form_id,
      billing,
    },
  };

  return {
    ...inspection,
    expiration: new Date(inspection.expiration),
    carrier_expiration: new Date(inspection.carrier_expiration),
    review_started: new Date(review_started),
    review_completed: new Date(review_completed),
  };
};

export const full_inspection = {
  _id: "8d59ff7264edba1ab4735b42",
  carrier: {
    _id: "5c59ff7264edba1ab4735b3c",
    name: "Test Carrier",
    support_email: "support@flyreel.co",
    settings: {
      cc_agent_on_emails: true,
      inspection_notifications: [
        "some.email@carrier.com",
        "another.email@carrier.com",
      ],
    },
    deleted: false,
    createdAt: "2019-02-05T21:26:10.372Z",
    updatedAt: "2019-02-05T21:26:10.372Z",
    isNew: true,
    __v: 0,
  },
  conversation: {
    _id: "6a23ff7264edba1ab4735k08",
    carrier: "5c59ff7264edba1ab4735b3c",
    name: "Residential Inspection",
    completed: false,
    modules: [
      {
        _id: "5d1b88ed82a672eb5aeb22a5",
        carrier: "5c59ff7264edba1ab4735b3c",
        name: "Bathroom - 1",
        completed: false,
        messages: [
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
          {
            _id: "5db214dba21a590011bd751d",
            carrier: "5c59ff7264edba1ab4735b3c",
            name: "Bathroom's countertops types",
            text: "What type of countertops do you have?",
            dashboard_text: "Type of countertops",
            show_in_dashboard: true,
            type: "select_multiple",
            options: ["Laminate", "Butcher Block", "Granite"],
            answer: ["Laminate", "Butcher Block", "Granite"],
            answer_time: "2019-02-05T21:26:10.372Z",
            completed: true,
            deleted: false,
            createdAt: new Date("2019-02-05T21:26:10.372Z"),
            updatedAt: new Date("2019-02-05T21:26:10.372Z"),
            isNew: true,
            __v: 0,
          },
          {
            _id: "5db214dba21a590011bd751d",
            carrier: "5c59ff7264edba1ab4735b3c",
            name: "Bathroom's floor",
            text: "What type of countertops do you have?",
            dashboard_text: "Type of countertops",
            show_in_dashboard: true,
            type: "text",
            answer: "Laminate",
            answer_time: "2019-02-05T21:26:10.372Z",
            completed: true,
            deleted: false,
            createdAt: new Date("2019-02-05T21:26:10.372Z"),
            updatedAt: new Date("2019-02-05T21:26:10.372Z"),
            isNew: true,
            __v: 0,
          },
          {
            _id: "5db214dba21a590011bd751d",
            carrier: "5c59ff7264edba1ab4735b3c",
            name: "Bathroom 1's!@##$%%^&&***(((()))) location",
            text: "What type of countertops do you have?",
            dashboard_text: "Type of countertops",
            show_in_dashboard: true,
            type: "location",
            answer: {
              coords: {
                lat: 39.703529,
                lng: -104.9608579,
              },
              address: "715 S York St, Denver, CO 80209, USA",
            },
            answer_time: "2019-02-05T21:26:10.372Z",
            completed: true,
            deleted: false,
            createdAt: new Date("2019-02-05T21:26:10.372Z"),
            updatedAt: new Date("2019-02-05T21:26:10.372Z"),
            isNew: true,
            __v: 0,
          },
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
        ],
        deleted: false,
        createdAt: new Date("2019-02-05T21:26:10.372Z"),
        updatedAt: new Date("2019-02-05T21:26:10.372Z"),
        isNew: true,
        __v: 0,
      },
    ],
    deleted: false,
    createdAt: new Date("2019-02-05T21:26:10.372Z"),
    updatedAt: new Date("2019-02-05T21:26:10.372Z"),
    isNew: true,
    __v: 0,
  },
  policy_id: "My-Full-Policy",
  policy_type: "new",
  first_name: "Test",
  last_name: "Client",
  email: "test@client.com",
  phone: "303-555-1212",
  code: "17b",
  status: "pending",
  expiration: "2030-01-01 18:00:00.000Z",
  carrier_expiration: "2030-01-03 18:00:00.000Z",
  address1: "123 Main St.",
  address2: null,
  city: "Anywhere",
  state: "CO",
  zip_code: "88888",
  location: {
    type: "Point",
    coordinates: [39.514553, -106.0467212],
  },
  agent_name: "Test Agent",
  agent_email: "test@agent.com",
  agent_phone: null,
  flyreel_type: "inspection",
  deleted: false,
  meta: {
    external_id: "external_inspection_id",
    forms: {
      inspection_form_id: "inspection_form_id",
      inspection_internal_form: "internal_form_id",
    },
  },
  createdAt: new Date("2019-02-05T21:26:10.372Z"),
  updatedAt: new Date("2019-02-05T21:26:10.372Z"),
  isNew: true,
  __v: 0,
};
