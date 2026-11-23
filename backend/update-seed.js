const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function syncSeed() {
  const c = await mongoose.createConnection('mongodb://localhost:27017/plan2').asPromise();
  const hashAdmin = await bcrypt.hash('admin123', 10);
  const hashDemo = await bcrypt.hash('demo123', 10);

  await c.collection('users').updateOne(
    { email: 'admin@demo.com' },
    { $set: { name: 'Admin User', role: 'ADMIN', password: hashDemo } },
    { upsert: true }
  );
  await c.collection('users').updateOne(
    { email: 'editor@demo.com' },
    { $set: { name: 'Editor User', role: 'EDITOR', password: hashDemo } },
    { upsert: true }
  );
  await c.collection('users').updateOne(
    { email: 'viewer@demo.com' },
    { $set: { name: 'Viewer User', role: 'VIEWER', password: hashDemo } },
    { upsert: true }
  );
  await c.collection('users').updateOne(
    { email: 'admin@example.com' },
    { $set: { name: 'Admin User', role: 'ADMIN', password: hashAdmin } },
    { upsert: true }
  );

  const targetId = new mongoose.Types.ObjectId('6ac202d4d1c09439df205139');
  const existingId = new mongoose.Types.ObjectId('6ac1fc0428cf87cbcfd03620');

  await c.collection('projects').updateOne(
    { _id: existingId },
    { $set: { status: 'ACTIVE', websiteUrl: 'http://localhost:3001', previewUrl: 'http://localhost:3001/preview' } }
  );

  await c.collection('projects').updateOne(
    { _id: targetId },
    {
      $setOnInsert: {
        name: 'Northstar Digital',
        slug: 'northstar',
        projectKey: 'NS-001',
        description: 'Northstar Digital website.',
        websiteUrl: 'http://localhost:3001',
        previewUrl: 'http://localhost:3001/preview',
        status: 'ACTIVE',
        draftVersion: 1,
        publishedVersion: 0,
        createdAt: new Date(),
      },
      $set: { updatedAt: new Date() },
    },
    { upsert: true }
  );

  const users = await c.collection('users').find({}).toArray();
  for (const u of users) {
    for (const pid of [targetId, existingId]) {
      await c.collection('memberships').updateOne(
        { userId: u._id, projectId: pid },
        { $set: { role: u.role || 'ADMIN' } },
        { upsert: true }
      );
    }
  }

  console.log('Done syncing MongoDB plan2 users, projects, and memberships');
  process.exit(0);
}

syncSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
