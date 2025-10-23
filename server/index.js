import express from 'express';
import cors from 'cors';
import { createClient } from 'redis';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
app.use(cors());
app.use(express.json());

// dist の静的ファイルを配信
app.use(express.static(path.join(__dirname, '../dist')));

const redisClient = createClient({
  url: 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis接続エラー:', err);
});

await redisClient.connect();
console.log('Redisに接続しました');

const subscriberClient = createClient({
  url: 'redis://127.0.0.1:6379'
});

subscriberClient.on('error', (err) => {
  console.error('Subscriber Redis接続エラー:', err);
});

await subscriberClient.connect();

await redisClient.configSet('notify-keyspace-events', 'KEA');
console.log('KEAを有効化しました');

// キー監視
await subscriberClient.pSubscribe('__keyspace@0__:*', async (message, channel) => {
  console.log(`Redis通知: チャンネル=${channel}, メッセージ=${message}`);
  
  const key = channel.replace('__keyspace@0__:', '');
  
  if (message === 'set' || message === 'hset') {
    try {
      const data = await redisClient.get(key);
      if (data) {
        const order = JSON.parse(data);
        
        io.emit('orderUpdated', {
          action: 'update',
          key: key,
          data: order
        });
      }
    } catch (err) {
      console.error('データ取得エラー:', err);
    }
  } else if (message === 'del') {
    console.log(`データが削除されました: ${key}`);
    
    io.emit('orderUpdated', {
      action: 'delete',
      key: key
    });
  }
});

async function findKeyByNumber(number) {
  const keys = await redisClient.keys('*');
  for (const key of keys) {
    const data = await redisClient.get(key);
    if (data) {
      const order = JSON.parse(data);
      if (order.number === number) {
        return key;
      }
    }
  }
  return null;
}

app.get('/api/orders', async (req, res) => {
  try {
    const { status } = req.query;
    
    const keys = await redisClient.keys('*');
    
    if (keys.length === 0) {
      return res.json([]);
    }

    const orders = [];
    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        const order = JSON.parse(data);
        if (!status || order.status === status) {
          orders.push(order);
        }
      }
    }

    orders.sort((a, b) => {
      const dateA = new Date(a.created.replace(/-/g, '/'));
      const dateB = new Date(b.created.replace(/-/g, '/'));
      return dateB - dateA;
    });

    res.json(orders);
  } catch (error) {
    console.error('注文取得エラー:', error);
    res.status(500).json({ error: '注文の取得に失敗しました' });
  }
});

app.get('/api/orders/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const key = await findKeyByNumber(number);
    
    if (!key) {
      return res.status(404).json({ error: '注文が見つかりません' });
    }

    const data = await redisClient.get(key);
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('注文取得エラー:', error);
    res.status(500).json({ error: '注文の取得に失敗しました' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { type, mail } = req.body;
    
    if (!type || !mail) {
      return res.status(400).json({ error: '必須フィールドが不足しています' });
    }

    const allKeys = await redisClient.keys('*');
    let maxNumber = 0;
    
    const regex = new RegExp(`^${type}(\\d{4})$`);
    
    for (const key of allKeys) {
      const match = key.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }
    
    const newNumber = maxNumber + 1;
    const paddedNumber = String(newNumber).padStart(4, '0');
    const created = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    
    const order = {
      number: paddedNumber,
      type,
      created,
      mail,
      status: 'false'
    };

    const redisKey = `${type}${paddedNumber}`;
    await redisClient.set(redisKey, JSON.stringify(order));
    res.json({ success: true, order, key: redisKey });
  } catch (error) {
    console.error('登録エラー:', error);
    res.status(500).json({ error: '登録に失敗しました' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { number, type, created, mail, status } = req.body;
    
    if (!number || !type || !created || !mail) {
      return res.status(400).json({ error: '必須フィールドが不足しています' });
    }

    const order = {
      number,
      type,
      created,
      mail,
      status: status || 'false'
    };

    const redisKey = `${type}${number}`;
    await redisClient.set(redisKey, JSON.stringify(order));
    res.json({ success: true, order });
  } catch (error) {
    console.error('注文作成エラー:', error);
    res.status(500).json({ error: '注文の作成に失敗しました' });
  }
});

app.patch('/api/orders/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const { status } = req.body;
    
    const key = await findKeyByNumber(number);
    if (!key) {
      return res.status(404).json({ error: '注文が見つかりません' });
    }

    const data = await redisClient.get(key);
    const order = JSON.parse(data);
    order.status = status;
    
    await redisClient.set(key, JSON.stringify(order));
    res.json({ success: true, order });
  } catch (error) {
    console.error('ステータス更新エラー:', error);
    res.status(500).json({ error: 'ステータスの更新に失敗しました' });
  }
});

app.delete('/api/orders/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const key = await findKeyByNumber(number);
    
    if (!key) {
      return res.status(404).json({ error: '注文が見つかりません' });
    }

    const result = await redisClient.del(key);
    
    if (result === 0) {
      return res.status(404).json({ error: '注文が見つかりません' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('注文削除エラー:', error);
    res.status(500).json({ error: '注文の削除に失敗しました' });
  }
});

// API例
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express' });
});

// React SPA フォールバック（path-to-regexp を通さないミドルウェア方式）
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) return next();
  if (req.path.startsWith('/socket.io')) return next(); // socket.io を除外
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`websocket OK`);
});