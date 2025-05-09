export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { connectToMongoDB } = require('../../utils/mongo');
      const db = await connectToMongoDB();
      const notes = await db.collection('notes').find().sort({ createdAt: -1 }).toArray();
      res.status(200).json(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}