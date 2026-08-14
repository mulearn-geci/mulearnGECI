const { chromium } = require('playwright');
const mongoose = require('mongoose');

const uri = 'mongodb+srv://mulearn_db_user:KqUswMcR3edtcZkx@mulearn-cluster.lkod39g.mongodb.net/mulearn?retryWrites=true&w=majority&appName=mulearn-cluster';

(async () => {
  try {
    await mongoose.connect(uri);
    const doc = await mongoose.connection.db.collection('homepageconfigs').findOne({ key: 'main_config' });
    if (!doc || !doc.cards) {
      console.log('No document or cards found.');
      process.exit(0);
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    for (let i = 0; i < doc.cards.length; i++) {
      const card = doc.cards[i];
      if (card.image && card.image.startsWith('data:image/') && card.image.length > 200000) {
        console.log(`Compressing Card #${i + 1} (${card.title}) from ${card.image.length} chars...`);
        const compressed = await page.evaluate((dataUri) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = dataUri;
            img.onload = () => {
              let width = img.width;
              let height = img.height;
              const max = 800;
              if (width > max || height > max) {
                if (width > height) {
                  height = Math.round((height * max) / width);
                  width = max;
                } else {
                  width = Math.round((width * max) / height);
                  height = max;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.65));
            };
            img.onerror = () => resolve(dataUri);
          });
        }, card.image);

        console.log(`Compressed to ${compressed.length} chars!`);
        doc.cards[i].image = compressed;
      }
    }

    await browser.close();

    const updateRes = await mongoose.connection.db.collection('homepageconfigs').updateOne(
      { _id: doc._id },
      { $set: { cards: doc.cards, updatedAt: new Date() } }
    );

    console.log('Database updated successfully! Modified count:', updateRes.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
