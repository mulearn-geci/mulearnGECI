const mongoose = require('mongoose');
const uri = 'mongodb+srv://mulearn_db_user:KqUswMcR3edtcZkx@mulearn-cluster.lkod39g.mongodb.net/mulearn?retryWrites=true&w=majority&appName=mulearn-cluster';

(async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const doc = await mongoose.connection.db.collection('homepageconfigs').findOne({ key: 'main_config' });
    if (!doc || !doc.cards) {
      console.log('No document found');
      process.exit(1);
    }

    doc.cards[3] = {
      id: '4',
      number: '04',
      meta: 'ALUMNI & CAREERS • SECURITY NETWORK',
      title: 'Introduction To CyberSecurity',
      description: 'Explore the fundamentals of cybersecurity with Mulearn! This program introduces students to essential concepts such as online safety, ethical hacking, common cyber threats, and digital security. Learn how to protect yourself and your data while developing practical cybersecurity skills through an engaging and beginner-friendly experience.',
      image: doc.cards[3]?.image || '',
      link: '/events',
      ctaText: 'Learn More'
    };

    const res = await mongoose.connection.db.collection('homepageconfigs').updateOne(
      { _id: doc._id },
      { $set: { cards: doc.cards, updatedAt: new Date() } }
    );
    console.log('Updated Card 4 in MongoDB! Modified count:', res.modifiedCount);

    const updated = await mongoose.connection.db.collection('homepageconfigs').findOne({ key: 'main_config' });
    console.log('Verified Card 4 Title:', updated.cards[3].title);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
