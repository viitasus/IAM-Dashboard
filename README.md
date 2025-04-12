# IAM-Dashboard

IAM-Dashboard is a web application designed to manage user identities and access permissions. Think of it as a control panel that helps administrators decide who can access what within a system. It's built using TypeScript, React, and Next.js, and it integrates with the INDIGO Identity and Access Management (IAM) system.

## 🚀 Features

* **User-Friendly Interface**: Provides an easy-to-use dashboard for managing users, groups, and access rights.
* **Secure Authentication**: Utilizes OpenID Connect/OAuth2 protocols for secure login and authorization.
* **Customizable**: Built with modern web technologies, allowing for easy customization and integration.

## 🛠️ Getting Started

### Prerequisites

* **Node.js**: Ensure you have Node.js (version 22 LTS) installed.
* **INDIGO IAM Instance**: Access to a running INDIGO IAM instance is required.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/viitasus/IAM-Dashboard.git
   cd IAM-Dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**: Create a `.env` file in the root directory with the following content:
   ```
   NODE_ENV=debug
   IAM_AUTHORITY_URL=https://iam-dev.cloud.cnaf.infn.it
   IAM_CLIENT_ID=your_client_id
   IAM_CLIENT_SECRET=your_client_secret
   IAM_SCOPES="openid profile scim:read scim:write iam:admin.read iam:admin.write"
   AUTH_SECRET=your_authentication_secret
   ```
   * Replace `your_client_id`, `your_client_secret`, and `your_authentication_secret` with your actual credentials.
   * To generate a secure `AUTH_SECRET`, you can use:
     ```bash
     openssl rand -base64 32
     ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Access the dashboard at `http://localhost:3000`.

## 🐳 Docker Deployment

For production environments, you can deploy the dashboard using Docker:

1. **Create an Environment File**: Create a `prod.env` file with the necessary environment variables as shown above.

2. **Run the Docker Container**:
   ```bash
   docker run -p 80:80 --env-file=prod.env cnafsoftwaredevel/iam-dashboard:latest
   ```

## 🔐 IAM Client Configuration

Before using the dashboard, register it as a client in your INDIGO IAM instance:

1. **Redirect URIs**:
   * For development: `http://localhost:3000/auth/callback/indigo-iam`
   * For production: `https://your-domain.com/auth/callback/indigo-iam`

2. **Scopes**: Ensure the following scopes are enabled:
   * `email`
   * `openid`
   * `profile`
   * `scim:read`
   * `scim:write`
   * `iam:admin.read`
   * `iam:admin.write`

3. **Grant Types**:
   * Enable `authorization_code`
   * Enable PKCE with SHA-256 algorithm

## 📄 License

This project is licensed under the Apache License 2.0.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

For more detailed information, refer to the INDIGO IAM Dashboard documentation.
