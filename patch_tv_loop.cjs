const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

const oldBlock = `    if (currentSignageMode === "rates") {
      const durationSeconds = ratesDisplayDuration || 12;
      setMediaTimeRemaining(durationSeconds);

      let elapsed = 0;
      intervalId = setInterval(() => {
        elapsed += 1;
        setMediaTimeRemaining(Math.max(0, durationSeconds - elapsed));
        if (elapsed >= durationSeconds) {
          setCurrentSignageMode("media");
          setActiveMediaIndex(0);
          clearInterval(intervalId);
        }
      }, 1000);
    } else {
      // currentSignageMode === 'media'
      const currentMediaItem = activeSignageMedia[activeMediaIndex];
      if (!currentMediaItem) {
        setCurrentSignageMode("rates");
        return;
      }

      const durationSeconds =
        currentMediaItem.displayDuration || slideshowDisplayDuration || 8;
      setMediaTimeRemaining(durationSeconds);

      let elapsed = 0;
      intervalId = setInterval(() => {
        elapsed += 1;
        setMediaTimeRemaining(Math.max(0, durationSeconds - elapsed));
        if (elapsed >= durationSeconds) {
          if (activeMediaIndex + 1 < activeSignageMedia.length) {
            setActiveMediaIndex((prev) => prev + 1);
          } else {
            setCurrentSignageMode("rates");
          }
          clearInterval(intervalId);
        }
      }, 1000);
    }`;

const newBlock = `    if (currentSignageMode === "rates") {
      const durationSeconds = ratesDisplayDuration || 12;
      setMediaTimeRemaining(durationSeconds);

      let elapsed = 0;
      intervalId = setInterval(() => {
        elapsed += 1;
        setMediaTimeRemaining(Math.max(0, durationSeconds - elapsed));
        if (elapsed >= durationSeconds) {
          setCurrentSignageMode("media");
          // Ensure index is within bounds before switching
          setActiveMediaIndex((prev) => prev % activeSignageMedia.length);
          clearInterval(intervalId);
        }
      }, 1000);
    } else {
      // currentSignageMode === 'media'
      const currentMediaItem = activeSignageMedia[activeMediaIndex];
      if (!currentMediaItem) {
        setCurrentSignageMode("rates");
        setActiveMediaIndex(0);
        return;
      }

      const durationSeconds =
        currentMediaItem.displayDuration || slideshowDisplayDuration || 8;
      setMediaTimeRemaining(durationSeconds);

      let elapsed = 0;
      intervalId = setInterval(() => {
        elapsed += 1;
        setMediaTimeRemaining(Math.max(0, durationSeconds - elapsed));
        if (elapsed >= durationSeconds) {
          // ALWAYS return to rates after playing exactly one media item
          setCurrentSignageMode("rates");
          // Advance to the next media item for the next round
          setActiveMediaIndex((prev) => (prev + 1) % activeSignageMedia.length);
          clearInterval(intervalId);
        }
      }, 1000);
    }`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay loop logic!");
