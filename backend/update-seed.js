const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/seo_admin_db').then(async () => {
  await mongoose.connection.collection('users').updateMany({ email: 'admin@demo.com' }, { $set: { role: 'ADMIN' } });
  await mongoose.connection.collection('users').updateMany({ email: 'editor@demo.com' }, { $set: { role: 'EDITOR' } });
  await mongoose.connection.collection('users').updateMany({ email: 'viewer@demo.com' }, { $set: { role: 'VIEWER' } });
  await mongoose.connection.collection('projects').updateMany({ projectKey: 'secret-project' }, { $set: { status: 'TEST_FIXTURE' } });
  
  // also normalize active status to ACTIVE
  await mongoose.connection.collection('projects').updateMany({ status: 'active' }, { $set: { status: 'ACTIVE' } });
  console.log('Done updating seed data');
  process.exit(0);
}).catch(console.error);
