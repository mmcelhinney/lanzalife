# Lanzalife Live Network Setup

This branch is configured to make the Lanzalife application available on your local network.

## Setup Instructions

### 1. Find Your Local IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

### 2. Configure Environment Variables

Create a `.env` file in the `packages/frontend` directory:

```bash
cd packages/frontend
touch .env
```

Add your local IP address to the `.env` file:
```
VITE_API_URL=http://YOUR_IP_ADDRESS:3000
```

Replace `YOUR_IP_ADDRESS` with your actual local IP (e.g., `192.168.1.100`).

### 3. Start the Backend

```bash
cd packages/backend
npm install
npm start
```

The backend will be available at:
- Local: `http://localhost:3000`
- Network: `http://YOUR_IP_ADDRESS:3000`

### 4. Start the Frontend

```bash
cd packages/frontend
npm install
npm run dev
```

The frontend will be available at:
- Local: `http://localhost:5173`
- Network: `http://YOUR_IP_ADDRESS:5173`

### 5. Access from Other Devices

Other devices on your local network can access the application at:
- `http://YOUR_IP_ADDRESS:5173`

## Network Configuration

- **Frontend**: Configured to bind to all network interfaces (`0.0.0.0:5173`)
- **Backend**: Configured to bind to all network interfaces (`0.0.0.0:3000`)
- **API Calls**: Use environment variable `VITE_API_URL` for flexible configuration

## Troubleshooting

1. **Firewall**: Ensure your firewall allows connections on ports 3000 and 5173
2. **Network**: Make sure all devices are on the same local network
3. **IP Changes**: If your IP address changes, update the `.env` file

## Security Note

This configuration is for local network use only. Do not expose these ports to the internet without proper security measures. 