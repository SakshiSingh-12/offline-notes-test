
export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query; // ID of the note to delete (likely localId stored as _id by client)

      if (!id) {
        return res.status(400).json({ error: 'Missing note ID' });
      }

      const { connectToMongoDB } = require('../../utils/mongo');
      const db = await connectToMongoDB();
      const { ObjectId } = require('mongodb');

      const result = await db.collection('notes').deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Note deleted successfully' });
      } else {
        res.status(404).json({ error: 'Note not found' });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}