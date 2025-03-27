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
import { setupRoyaltyEventFlow } from './utils/listner';

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
          const imageId = Number(payload.imageId);
          const sha256Hash = payload.sha256Hash?.replace(/^0x/, "");

          //Once the image is registerted then store it in the database with updatd imageId
          const updated = await PostModel.findOneAndUpdate(
            { sha256: sha256Hash },
            { imageId },
            { new: true }
          );

          if (updated) {
            console.log(`Post updated with imageId ${imageId}`);
          } else {
            console.warn("No matching post found for sha256:", sha256Hash);
          }
        }

        // Handle like event
        if (sig?.includes("PostLiked") && payload) {
          const imageId = Number(payload.imageId);
          const user = payload.user;
          const numberOfLikes = payload.totalLikes;

          const posts = await PostModel.find({ imageId });
          if (!posts.length) {
            console.warn(`No posts found with imageId: ${imageId}`);
            return;
          }

          for (const post of posts) {
            if (!post.derivedFrom) {
              post.likeCount = numberOfLikes;
              await post.save();
              console.log(`Synced like count for original post ${post._id} → ${post.likeCount}`);
              const postliker = await UserModel.findOne({ fireflyKey: String(user) });
              console.log(postliker)
              if(postliker){
              // Send notific tion to the original post owner about the like update
              if(post.artist){
        
             
                const message=`Your post was liked by ${postliker.username}.`;
                sendNotificationToUser(post.artist.toString(), message);

                await Notification.create({
                  userId: post.artist.toString(),
                  message,
                  read: false,
                });
              }
            }
              
            }
          }
        }



        //Royalty listner 
        if (sig?.includes("RoyaltyPaid") && payload) {
          console.log("Royalty caught!")
          const imageId = Number(payload.imageId);
          const payerKey = payload.user;
        
          const posts = await PostModel.find({ imageId: imageId });
        
          if (posts.length === 0) return;
        
          const basePost = posts.find(p => !p.derivedFrom); // original pos // t
          if (!basePost || !basePost.artist) return;
        
          const payer = await UserModel.findOne({ fireflyKey: String(payerKey) });
          if (!payer) return;
        
          const message = `You have received a royalty from ${payer.username}.`;
        
          // WebSocket
          sendNotificationToUser(basePost.artist.toString(), message);
        
          // DB
          await Notification.create({
            userId: basePost.artist.toString(),
            message,
            read: false,
            createdAt: new Date(),
          });
        
          console.log(`Royalty notification sent to ${basePost.artist} from ${payer.username}`);
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
  //await setupEventFlow(imageInterfaceId);
  await setupLikeEventFlow(likeInterfaceId);
  await setupRoyaltyEventFlow(imageInterfaceId);

  await listenToEvents();

  // Start the server
  server.listen(config.PORT, () =>
    console.log(`🚀 Kaleido DApp backend listening on port ${config.PORT}!`)
  );
}

init().catch((err) => {
  console.error(err.stack);
});

module.exports = { app };
