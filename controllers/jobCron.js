const cron = require('node-cron');
const JobPost = require('../schema/Job_PostSchema'); // Adjust path as needed


// Schedule a cron job that runs every midnight to check for expired job posts
cron.schedule('0 0 * * *', async () => {
    console.log("cron is running for checkin job post");
    try {
        const currentDate = new Date();

        // Find job posts that are still open and have passed the deadline
        const expiredJobPosts = await JobPost.find({
            status: 'open',
            deadline: { $lt: currentDate }
        });

        // Close all expired job posts
        for (let jobPost of expiredJobPosts) {
            jobPost.status = 'closed'; // Update the status to 'closed'
            await jobPost.save();
            console.log(`Job post "${jobPost.title}" closed due to expired deadline.`);
        }
    } catch (error) {
        console.error('Error closing expired job posts:', error);
    }
});
