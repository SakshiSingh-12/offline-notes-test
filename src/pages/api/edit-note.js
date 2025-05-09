
export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { id } = req.query; // ID of the note to edit (likely localId stored as _id by client)
      const { title: noteTitle, tags } = req.body; // New title and tags

      if (!id || typeof noteTitle !== 'string') {
        return res.status(400).json({ error: 'Missing note ID or title' });
      }

      const { connectToMongoDB } = require('../../utils/mongo');
      const db = await connectToMongoDB();
      const { ObjectId } = require('mongodb');

      // Build update object
      const updateObj = { title: noteTitle };
      if (tags !== undefined) {
        updateObj.tags = Array.isArray(tags) ? tags : [];
      }
      const result = await db.collection('notes').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateObj }
      );

      if (result.matchedCount > 0) {
        res.status(200).json({ message: 'Note edited successfully' });
      } else {
        res.status(404).json({ error: 'Note not found' });
      }
    } catch (error) {
      console.error('Error editing note:', error);
      res.status(500).json({ error: 'Failed to edit note' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}