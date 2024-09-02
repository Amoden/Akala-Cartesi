# Decentralized Job Board DApp

This decentralized application (DApp) implements a job board system using Cartesi Rollups technology. Employers can post job listings, job seekers can apply for jobs, and both parties can view job listings and applications.

## Installation

1. Clone this repository:

   ```
   git clone <repository-url>
   cd job-board-dapp
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Interacting with the DApp

### Sending Inputs (Advance Requests)

1. Post a job listing:

   ```json
   {
     "action": "post_job",
     "title": "Software Engineer",
     "description": "We are looking for a talented software engineer...",
     "employer": "TechCorp"
   }
   ```

2. Apply for a job:

   ```json
   {
     "action": "apply_for_job",
     "jobId": 1,
     "applicant": "John Doe",
     "resume": "Experienced software engineer with 5 years..."
   }
   ```

3. Get all job listings:

   ```json
   {
     "action": "get_job_listings"
   }
   ```

4. Get applications for a specific job:

   ```json
   {
     "action": "get_applications",
     "jobId": 1
   }
   ```

### Making Inspect Calls

To read the state without modifying it, use the following inspect payloads:

- View all job listings: `"list_jobs"`
- View all applications: `"list_applications"`
