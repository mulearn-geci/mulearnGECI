const cron = require('node-cron');
const Event = require('./models/Event'); // adjust path to your Event model

// Run every 1 minute (you can adjust to "0 * * * *" for every hour)
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();

    // Get all events still marked as "upcoming"
    const events = await Event.find({ status: 'upcoming' });

    for (const event of events) {
      let eventDateTime = new Date(event.date);
      if (event.time) {
        const [hours, minutes] = event.time.split(':').map(Number);
        eventDateTime.setHours(hours || 0, minutes || 0, 0, 0);
      }

      if (eventDateTime < now) {
        event.status = 'completed';
        await event.save();
        console.log(`Event "${event.title}" marked as completed`);
      }
    }
  } catch (err) {
    console.error('Error updating event statuses:', err);
  }
});
