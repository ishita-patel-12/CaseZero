import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { initSocket } from './socket.js';

await mongoose.connect(process.env.MONGO_URI);
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

initSocket(server, clientUrl);

server.listen(port, () => console.log(`CaseZero API & Socket server running on port ${port}`));

