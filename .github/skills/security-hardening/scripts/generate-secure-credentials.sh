#!/bin/bash

# Secure Credential Generator for Angular Firebase Applications
# Generates cryptographically secure passwords and helps with environment setup

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Secure Credential Generator${NC}"
echo "=================================="

# Function to generate secure password
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Generate admin password
echo -e "${GREEN}🔑 Generating secure admin password...${NC}"
ADMIN_PASSWORD=$(generate_password 24)
echo "Admin Password: $ADMIN_PASSWORD"

# Generate API key placeholder (for Firebase setup)
echo -e "${GREEN}🗝️ Generating API key format example...${NC}"
API_KEY_EXAMPLE="AIza$(generate_password 35)"
echo "API Key Format: $API_KEY_EXAMPLE"

# Generate session secrets
echo -e "${GREEN}🎟️ Generating session secrets...${NC}"
SESSION_SECRET=$(generate_password 48)
echo "Session Secret: $SESSION_SECRET"

# Create .env.local file
ENV_FILE=".env.local"
echo -e "${YELLOW}📄 Creating $ENV_FILE...${NC}"

cat > $ENV_FILE << EOF
# 🔒 LOCAL ENVIRONMENT VARIABLES
# Add this file to .gitignore - never commit secrets!

# Admin Authentication
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Session Management  
SESSION_SECRET=$SESSION_SECRET

# Firebase Configuration (replace with your actual values)
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Optional: Additional Security Settings
MFA_SECRET=$(generate_password 32)
JWT_SECRET=$(generate_password 64)
ENCRYPTION_KEY=$(generate_password 32)
EOF

echo -e "${GREEN}✅ Generated $ENV_FILE with secure credentials${NC}"

# Update .gitignore
if [[ ! -f ".gitignore" ]] || ! grep -q ".env.local" .gitignore; then
    echo "# Local environment variables" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env.*.local" >> .gitignore
    echo -e "${GREEN}✅ Added .env.local to .gitignore${NC}"
fi

# Create environment setup instructions
cat << EOF

${BLUE}📋 Next Steps:${NC}

1. ${YELLOW}Update your environment files:${NC}
   - Replace hardcoded passwords with process.env['ADMIN_PASSWORD']
   - Use the generated secrets in your configuration

2. ${YELLOW}Firebase Setup:${NC}
   - Get your actual Firebase config from Firebase Console
   - Replace placeholder values in $ENV_FILE
   - Update environment.prod.ts to use environment variables

3. ${YELLOW}Verify Setup:${NC}
   - Run: npm install dotenv (if not already installed)
   - Test that environment variables load correctly
   - Ensure .env.local is in .gitignore

4. ${YELLOW}Security Validation:${NC}
   - Scan for remaining hardcoded credentials
   - Test Firebase rules with new authentication
   - Verify production build removes all secrets

${GREEN}🔐 Security Best Practices:${NC}
- Never commit the .env.local file
- Use different credentials for dev/staging/production  
- Rotate passwords regularly
- Monitor for credential exposure in logs
- Set up alerting for authentication failures

EOF