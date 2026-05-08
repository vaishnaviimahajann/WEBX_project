const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillsync')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const JWT_SECRET = process.env.JWT_SECRET || 'skillsync_secret_2026';

// ─── Schemas ───────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college:  { type: String, default: '' },
  branch:   { type: String, default: '' },
  bio:      { type: String, default: '' },
  skills:   [String],
  github:   { type: String, default: '' },
  linkedin: { type: String, default: '' },
  avatar:   { type: String, default: '' },
}, { timestamps: true });

const connectionSchema = new mongoose.Schema({
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:   { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text:     { type: String, required: true },
}, { timestamps: true });

const User       = mongoose.model('User', userSchema);
const Connection = mongoose.model('Connection', connectionSchema);
const Message    = mongoose.model('Message', messageSchema);

// ─── Middleware ────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

// ─── Auth Routes ───────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, college, branch } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'All fields required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, college, branch });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, college: user.college, branch: user.branch, skills: user.skills, bio: user.bio, github: user.github, linkedin: user.linkedin } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Wrong password' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, college: user.college, branch: user.branch, skills: user.skills, bio: user.bio, github: user.github, linkedin: user.linkedin } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// ─── User Routes ───────────────────────────────────────────────
app.put('/api/users/profile', auth, async (req, res) => {
  try {
    const { name, college, branch, bio, skills, github, linkedin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, college, branch, bio, skills, github, linkedin },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.get('/api/users/discover', auth, async (req, res) => {
  try {
    const { search, skill } = req.query;
    let filter = { _id: { $ne: req.user.id } };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { college: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ];
    if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── Connection Routes ─────────────────────────────────────────
app.post('/api/connections/send', auth, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const existing = await Connection.findOne({ sender: req.user.id, receiver: receiverId });
    if (existing) return res.status(400).json({ msg: 'Request already sent' });
    const conn = await Connection.create({ sender: req.user.id, receiver: receiverId });
    res.json(conn);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.get('/api/connections', auth, async (req, res) => {
  try {
    const incoming = await Connection.find({ receiver: req.user.id, status: 'pending' })
      .populate('sender', '-password');
    const sent = await Connection.find({ sender: req.user.id, status: 'pending' })
      .populate('receiver', '-password');
    const friends = await Connection.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
      status: 'accepted'
    }).populate('sender receiver', '-password');
    res.json({ incoming, sent, friends });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.put('/api/connections/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const conn = await Connection.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(conn);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── Message Routes ────────────────────────────────────────────
app.get('/api/messages/:userId', auth, async (req, res) => {
  try {
    const msgs = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort('createdAt');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── Socket.io ────────────────────────────────────────────────
const onlineUsers = {};

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    onlineUsers[userId] = socket.id;
  });

  socket.on('send_message', async ({ senderId, receiverId, text }) => {
    const msg = await Message.create({ sender: senderId, receiver: receiverId, text });
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) io.to(receiverSocket).emit('receive_message', msg);
    socket.emit('message_sent', msg);
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of Object.entries(onlineUsers)) {
      if (sid === socket.id) { delete onlineUsers[uid]; break; }
    }
  });
});

// ─── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 SkillSync server on port ${PORT}`));
