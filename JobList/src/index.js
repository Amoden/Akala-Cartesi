const { hexToString, stringToHex } = require("viem");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

const jobListings = {};
const applications = {};
let nextJobId = 1;
let nextApplicationId = 1;

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const payloadString = hexToString(data.payload);
  console.log(`Converted payload: ${payloadString}`);

  try {
    const payload = JSON.parse(payloadString);
    let response;

    switch (payload.action) {
      case "post_job":
        const jobId = nextJobId++;
        jobListings[jobId] = {
          title: payload.title,
          description: payload.description,
          employer: payload.employer,
          timestamp: Date.now()
        };
        response = `Job posted with ID: ${jobId}`;
        break;
      case "apply_for_job":
        const applicationId = nextApplicationId++;
        applications[applicationId] = {
          jobId: payload.jobId,
          applicant: payload.applicant,
          resume: payload.resume,
          timestamp: Date.now()
        };
        response = `Application submitted with ID: ${applicationId}`;
        break;
      case "get_job_listings":
        response = JSON.stringify(jobListings);
        break;
      case "get_applications":
        const jobApplications = Object.values(applications).filter(app => app.jobId === payload.jobId);
        response = JSON.stringify(jobApplications);
        break;
      default:
        response = "Invalid action";
    }

    const outputStr = stringToHex(response);
    await fetch(rollup_server + "/notice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: outputStr }),
    });
  } catch (error) {
    console.error("Error processing request:", error);
  }
  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));

  const payload = data["payload"];
  const route = hexToString(payload);

  let responseObject;

  if (route === "list_jobs") {
    responseObject = JSON.stringify(jobListings);
  } else if (route === "list_applications") {
    responseObject = JSON.stringify(applications);
  } else {
    responseObject = "route not implemented";
  }

  await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: stringToHex(responseObject) }),
  });

  return "accept";
}


var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();