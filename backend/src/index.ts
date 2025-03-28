import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import { Server as SocketIOServer } from 'socket.io';  // Import Socket.IO server
import imageRoutes from './routes/image.routes';
import authRoutes from './routes/auth.route';
import likeRoutes from './routes/likes.route';
import { connectToDatabase } from './utils/db';
import { PostModel } from './models/Posts';
import { fireflyClient } from './services/firefly-contract.service';
import { setupImageRegistryContract, contractApiName } from "./services/firefly-contract.service";
import { setupLikeRegistryContract, likeApiName } from "./services/firefly-like-contract.service";
import { setupLikeEventFlow } from './utils/like_listner';
import { Notification } from './models/Notifications';
import notificationRoutes from './routes/notification.route';
import config from '../config.json';
import { UserModel } from './models/Users';
import { setupRoyaltyEventFlow,setupEventFlow } from './utils/listner';
import { ImageRegistryModel } from './models/ImageRegistryModel';
import { Types } from 'mongoose';

const app = express();

// Create HTTP server and integrate with Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
export { io };

// This is to store connected users' socket IDs
let users: { [userId: string]: string } = {}; // Mapping : {userId: socketId}

app.use(bodyParser.json());
app.use("/api", imageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", likeRoutes);
app.use("/api", notificationRoutes);

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('User connected');

  // Register the user by their userId
  socket.on('register', (userId: string) => {
    users[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });

  // Handle disconnections
  socket.on('userDisconnect', () => {
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Function to send notifications to a specific user
export function sendNotificationToUser(userId: string, message: string) {
  if (users[userId]) {
    io.to(users[userId]).emit('notification', { message });  // Send notification to specific user
  } else {
    console.log(`User with ID ${userId} is not connected`);
  }
}

// Listen to blockchain events and send notifications
async function listenToEvents() {
  fireflyClient.listen(
    { filter: { events: "blockchain_event_received" } },
    async (socket, event) => {
      if ("blockchainEvent" in event) {

        const blockchainEvent = event.blockchainEvent as any;
        const sig = blockchainEvent.info?.signature;
        const payload = blockchainEvent.output;

        console.log("Received blockchain event:", sig);
        
        // Handle image registered event
        
        if (sig?.includes("ImageRegistered") && payload) {
          const {
            imageId,
            sha256Hash,
            pHash,
            ipfsHash,
            timestamp,
            requireRoyalty,
            uploader, // msg.sender
            originalArtistName,
            originalOrg,
            originalArtistAddress,
            isDerived,
            duplicatorName,
            duplicatorOrg,
          } = payload;
        
          const sha256 = sha256Hash.replace(/^0x/, "");
          const pHashClean = pHash.replace(/^0x/, "");
        
          if (isDerived) {
            // Only notify original artist — don't store in ImageRegistryModel
            const originalUser = await UserModel.findOne({ fireflyKey: originalArtistAddress });
        
            if (originalUser) {
              const message = `Your post has been duplicated by ${duplicatorName} from ${duplicatorOrg}.`;
              const idStr = (originalUser._id as Types.ObjectId).toString();
        
              sendNotificationToUser(idStr, message);
              await Notification.create({
                userId: originalUser._id,
                message,
                read: false,
                createdAt: new Date(),
              });
        
              console.log(`Notified ${originalUser.username} of duplication`);
            } else {
              console.warn("Original artist not found locally:", originalArtistAddress);
            }
          } else {
            //  Store original image metadata
            await ImageRegistryModel.create({
              imageId,
              sha256,
              pHash: pHashClean,
              ipfsHash,
              artist: uploader,
              artistName: originalArtistName,
              org: originalOrg,
              isDerived: false,
              timestamp: new Date(Number(timestamp) * 1000),
              requireRoyalty,
            });
        
            console.log(`Stored original image metadata for imageId ${imageId}`);
          }
        

          // Update the post created by this uploader (original or derived)

          const updated = await PostModel.findOneAndUpdate(
            { sha256: sha256, fireflyKey: uploader },  // fireflyKey matches Ethereum address
            { imageId },
            { new: true }
          );
          if (updated) {
            console.log(`Updated PostModel with imageId ${imageId}`);
          } else {
            console.warn("No matching post found to update imageId");
          }
        }        
        
        // Handle like event
        if (sig?.includes("PostLiked") && payload) {
          const imageId = Number(payload.imageId);
          const likerAddress = payload.user;
          const totalLikes = payload.totalLikes;
      
          // Find all posts with this imageId (could be original or derived)
          const posts = await PostModel.find({ imageId });
      
          if (posts.length === 0) {
            console.warn(`No PostModel found for imageId: ${imageId}`);
            return;
          }
      
          // Get liker (may be undefined)
          const liker = await UserModel.findOne({ fireflyKey: String(likerAddress) });
          const likerName = liker?.username || "someone from different org";
      
          for (const post of posts) {
            //  1. Update like count
            post.likeCount = totalLikes;
            await post.save();
      
            //  2. Notify post artist (always)
            const postArtist = await UserModel.findById(post.artist);
            if (postArtist) {
              const message = `Your post was liked by ${likerName}!`;
              const idStr = (postArtist._id as Types.ObjectId).toString();
              
              sendNotificationToUser(idStr, message);
      
              await Notification.create({
                userId: postArtist._id,
                message,
                read: false,
              });
            }
          }
        }
        

        //Royalty listner 
        if (sig?.includes("RoyaltyPaid") && payload) {
          const imageId = Number(payload.imageId);
          const payerKey = payload.user;
          const payerName = payload.payerName;
          const payerOrg = payload.payerOrg;
        
          const posts = await PostModel.find({ imageId });
          if (!posts.length) return;
        
          const basePost = posts.find(p => !p.derivedFrom);
          if (!basePost || !basePost.artist) return;
        
          const message = `You received royalty from ${payerName || "someone"} (${payerOrg || "unknown org"}).`;
        
          sendNotificationToUser(basePost.artist.toString(), message);
          await Notification.create({
            userId: basePost.artist.toString(),
            message,
            read: false,
            createdAt: new Date(),
          });
        
          console.log(`Royalty paid for image ${imageId} by ${payerName} from ${payerOrg}`);
        }
      }
    }
  );
}

// Start the server and listen for blockchain events
async function init() {
  await connectToDatabase();

  const { interfaceId: imageInterfaceId } = await setupImageRegistryContract();
  const likeInterfaceId = await setupLikeRegistryContract();
  setupEventFlow(imageInterfaceId);
  await setupLikeEventFlow(likeInterfaceId);
  await setupRoyaltyEventFlow(imageInterfaceId);

  await listenToEvents();

  // Start the server
  server.listen(config.PORT, () =>
    console.log(`Kaleido DApp backend listening on port ${config.PORT}!`)
  );
}

init().catch((err) => {
  console.error(err.stack);
});

module.exports = { app };
