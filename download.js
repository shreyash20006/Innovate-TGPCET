import fs from 'fs';
import https from 'https';

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

const file = fs.createWriteStream("public/veo-video.mp4");
https.get("https://drive.google.com/uc?export=download&id=1x-w1cYZ9X09NjXbqz_JjqVQXMEIsafE2", function(response) {
  response.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Download Completed");
  });
});
