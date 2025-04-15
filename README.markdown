# IAM-Dashboard

IAM-Dashboard is a Flask-based web application for managing user identities and access permissions. It provides a control panel for administrators to manage access within a system, integrating with the INDIGO Identity and Access Management (IAM) system for secure authentication and authorization.

## 🚀 Features

- **User-Friendly Interface**: Intuitive dashboard for managing users, groups, and access rights.
- **Secure Authentication**: Uses OpenID Connect/OAuth2 protocols for robust login and authorization.
- **Customizable**: Built with Flask, enabling easy extension and integration.

## 🐳 Running with Docker

### Prerequisites

- **Docker**: Ensure Docker is installed and running.
- **INDIGO IAM Instance**: Access to a running INDIGO IAM instance.

### Setup and Deployment

1. **Clone the Repository**:
   ```
   git clone https://github.com/viitasus/IAM-Dashboard.git
   cd IAM-Dashboard
   ```

2. **Configure Environment Variables**: Create a `prod.env` file in the root directory with the following:
   ```
   FLASK_ENV=production
   IAM_AUTHORITY_URL=https://iam-dev.cloud.cnaf.infn.it
   IAM_CLIENT_ID=your_client_id
   IAM_CLIENT_SECRET=your_client_secret
   IAM_SCOPES="openid profile scim:read scim:write iam:admin.read iam:admin.write"
   SECRET_KEY=your_authentication_secret
   ```
   - Replace `your_client_id`, `your_client_secret`, and `your_authentication_secret` with your actual credentials.
   - Generate a secure `SECRET_KEY` using:
     ```
     python -c "import secrets; print(secrets.token_urlsafe(32))"
     ```

3. **Run the Docker Container**:
   ```
   docker run -p 80:5000 --env-file=prod.env cnafsoftwaredevel/iam-dashboard:latest
   ```
   - This maps port 80 on your host to port 5000 in the container.
   - Access the dashboard at `http://localhost`.

### Building the Docker Image (Optional)

If you need to build the Docker image locally:

1. **Create a `Dockerfile`** (if not already present in the repository):
   ```
   FROM python:3.9-slim

   WORKDIR /app
   COPY . .
   RUN pip install --no-cache-dir -r requirements.txt

   ENV FLASK_APP=app.py
   EXPOSE 5000

   CMD ["flask", "run", "--host=0.0.0.0"]
   ```

2. **Build the Image**:
   ```
   docker build -t iam-dashboard:latest .
   ```

3. **Run the Container**:
   ```
   docker run -p 80:5000 --env-file=prod.env iam-dashboard:latest
   ```

## 🔐 IAM Client Configuration

Register the dashboard as a client in your INDIGO IAM instance:

1. **Redirect URIs**:
   - Production: `https://your-domain.com/auth/callback/indigo-iam`
   - Local Docker: `http://localhost/auth/callback/indigo-iam`

2. **Scopes**: Enable the following:
   - `email`
   - `openid`
   - `profile`
   - `scim:read`
   - `scim:write`
   - `iam:admin.read`
   - `iam:admin.write`

3. **Grant Types**:
   - Enable `authorization_code`
   - Enable PKCE with SHA-256 algorithm

## 📄 License

This project is licensed under the Apache License 2.0.

## 🤝 Contributing

Contributions are welcome! Fork the repository and submit a pull request.

For more details, refer to the [INDIGO IAM Dashboard documentation](https://github.com/viitasus/IAM-Dashboard).