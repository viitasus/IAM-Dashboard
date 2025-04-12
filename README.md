IAM-Dashboard
IAM-Dashboard is a web application designed to manage user identities and access permissions. Think of it as a control panel that helps administrators decide who can access what within a system. It's built using TypeScript, React, and Next.js, and it integrates with the INDIGO Identity and Access Management (IAM) system.​

🚀 Features
User-Friendly Interface: Provides an easy-to-use dashboard for managing users, groups, and access rights.​

Secure Authentication: Utilizes OpenID Connect/OAuth2 protocols for secure login and authorization.​

Customizable: Built with modern web technologies, allowing for easy customization and integration.​

🛠️ Getting Started
Prerequisites
Node.js: Ensure you have Node.js (version 22 LTS) installed.​

INDIGO IAM Instance: Access to a running INDIGO IAM instance is required.​

Installation
Clone the Repository:

bash
Copy
Edit
git clone https://github.com/viitasus/IAM-Dashboard.git
cd IAM-Dashboard
Install Dependencies:

bash
Copy
Edit
npm install
Configure Environment Variables: Create a .env file in the root directory with the following content:

env
Copy
Edit
NODE_ENV=debug
IAM_AUTHORITY_URL=https://iam-dev.cloud.cnaf.infn.it
IAM_CLIENT_ID=your_client_id
IAM_CLIENT_SECRET=your_client_secret
IAM_SCOPES="openid profile scim:read scim:write iam:admin.read iam:admin.write"
AUTH_SECRET=your_authentication_secret
Replace your_client_id, your_client_secret, and your_authentication_secret with your actual credentials.​

To generate a secure AUTH_SECRET, you can use:​

bash
Copy
Edit
openssl rand -base64 32
Start the Development Server:

bash
Copy
Edit
npm run dev
Access the dashboard at http://localhost:3000.

🐳 Docker Deployment
For production environments, you can deploy the dashboard using Docker:​

Create an Environment File: Create a prod.env file with the necessary environment variables as shown above.

Run the Docker Container:

bash
Copy
Edit
docker run -p 80:80 --env-file=prod.env cnafsoftwaredevel/iam-dashboard:latest
🔐 IAM Client Configuration
Before using the dashboard, register it as a client in your INDIGO IAM instance:​

Redirect URIs:

For development: http://localhost:3000/auth/callback/indigo-iam​
GitHub

For production: https://your-domain.com/auth/callback/indigo-iam​

Scopes: Ensure the following scopes are enabled:

email​
GitHub

openid​
GitHub
+1
GitHub
+1

profile​
GitHub

scim:read​
Reddit
+8
GitHub
+8
GitHub
+8

scim:write​
GitHub
+4
Reddit
+4
Amazon Web Services, Inc.
+4

iam:admin.read​
GitHub

iam:admin.write​
Repost

Grant Types:

Enable authorization_code.​
GitHub
+5
GitHub
+5
Amazon Web Services, Inc.
+5

Enable PKCE with SHA-256 algorithm.​
GitHub

📄 License
This project is licensed under the Apache License 2.0.​

🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.​

For more detailed information, refer to the INDIGO IAM Dashboard documentation.