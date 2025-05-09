
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const noteData = req.body;

      // Basic validation (optional, but good practice)
      if (!noteData || !noteData.title || !noteData.localId || !noteData.createdAt) {
        return res.status(400).json({ error: 'Invalid note data' });
      }

      const { connectToMongoDB } = require('../../utils/mongo');
      const db = await connectToMongoDB();

      // Save the noteData object to the 'notes' collection
      // Ensure tags is always an array
      if (!Array.isArray(noteData.tags)) {
        noteData.tags = [];
      }
      const result = await db.collection('notes').insertOne(noteData);

      // Respond with the identifier assigned by MongoDB
      res.status(200).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error('Error saving note:', error);
      res.status(500).json({ error: 'Failed to save note' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}