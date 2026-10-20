// Generate minimal valid MP3 placeholder files
// Run with: node generate-audio.js

const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'assets', 'audio');
fs.mkdirSync(outputDir, { recursive: true });

function createMp3File(filePath, durationSec) {
  // ID3v2 header (10 bytes) for compatibility
  const id3 = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  
  // Valid MPEG1 Layer3 frame: 417 bytes at 128kbps/44100Hz
  // Each frame = ~26.12ms of audio
  const frameSize = 417;
  const frame = Buffer.alloc(frameSize, 0);
  frame[0] = 0xFF; // Sync
  frame[1] = 0xFB; // MPEG1, Layer3, no CRC
  frame[2] = 0x90; // 128kbps, 44100Hz
  frame[3] = 0x00; // Stereo
  
  const numFrames = Math.max(1, Math.ceil((durationSec * 1000) / 26.12));
  const buffers = [id3];
  for (let i = 0; i < numFrames; i++) buffers.push(Buffer.from(frame));
  
  fs.writeFileSync(filePath, Buffer.concat(buffers));
  const size = fs.statSync(filePath).size;
  console.log(`Created: ${path.basename(filePath)} (${size} bytes, ~${durationSec}s, ${numFrames} frames)`);
}

const files = [
  ['bg-music.mp3', 3.0],
  ['click.mp3', 0.1],
  ['bow-pull.mp3', 0.5],
  ['arrow-shoot.mp3', 0.3],
  ['heart-burst.mp3', 0.5],
  ['text-pop.mp3', 0.05],
  ['tap-next.mp3', 0.3],
  ['match-strike.mp3', 0.3],
  ['blow.mp3', 0.5],
  ['cheer.mp3', 1.0],
  ['balloon-pop.mp3', 0.2],
  ['card-reveal.mp3', 0.3],
  ['all-popped.mp3', 0.5],
  ['swipe.mp3', 0.2],
  ['envelope-open.mp3', 0.5],
  ['typewriter.mp3', 0.3],
  ['finale-fanfare.mp3', 1.5],
];

files.forEach(([name, dur]) => createMp3File(path.join(outputDir, name), dur));
console.log(`\nDone! ${files.length} placeholder MP3 files created.`);
