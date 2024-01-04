const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/download', async (req, res) => {
    try {
        const { url, choice } = req.query;
        if (!url || !choice) {
            return res.status(400).send('URL and choice are required.');
        }

        if (choice !== 'audio') {
            let videoFormat = 'mp4';
            let contentType = 'video/mp4';
            let filter = 'videoandaudio';

            const videoInfo = await ytdl.getInfo(url);
            const videoTitle = videoInfo.videoDetails.title;

            const formats = ytdl.filterFormats(videoInfo.formats, format => {
                if (filter === 'audioonly') {
                    return format.container === videoFormat && format.hasAudio && format.hasVideo;
                } else {
                    return format.container === videoFormat && format.hasVideo && format.hasAudio;
                }
            });

            console.log('Available formats:', formats);

            if (!formats.length) {
                return res.status(404).send('Video/audio in the selected format not available.');
            }

            const downloadURL = ytdl(url, {
                format: formats[0],
            });

            res.header('Content-Disposition', `attachment; filename="${videoTitle}.${videoFormat}"`);
            res.header('Content-Type', contentType);
            downloadURL.pipe(res);
        } else {
            const audioFormat = 'audio/mp3'; // Desired audio format
            const contentType = 'audio/mp3';

            const videoInfo = await ytdl.getInfo(url);
            const videoTitle = videoInfo.videoDetails.title;

            const format = ytdl.chooseFormat(videoInfo.formats, { filter: 'audioonly' });

            if (!format) {
                return res.status(404).send('Audio in the selected format not available.');
            }

            const downloadURL = ytdl(url, {
                format,
            });

            res.header('Content-Disposition', `attachment; filename="${videoTitle}.${audioFormat.split('/')[1]}"`);
            res.header('Content-Type', contentType);
            downloadURL.pipe(res);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
