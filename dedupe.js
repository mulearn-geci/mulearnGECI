const mongoose = require('mongoose');
const HomepageConfig = require('./server/models/HomepageConfig');

mongoose.connect('mongodb+srv://mulearn_db_user:KqUswMcR3edtcZkx@mulearn-cluster.lkod39g.mongodb.net/mulearn?retryWrites=true&w=majority&appName=mulearn-cluster', { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  const configs = await HomepageConfig.find({ key: 'main_config' });
  console.log('Found documents:', configs.length);
  if (configs.length > 1) {
    // Keep the most recently updated one
    configs.sort((a, b) => b.updatedAt - a.updatedAt);
    const toDelete = configs.slice(1).map(c => c._id);
    await HomepageConfig.deleteMany({ _id: { $in: toDelete } });
    console.log('Deleted duplicate documents:', toDelete.length);
  }
  process.exit(0);
}).catch(console.error);
