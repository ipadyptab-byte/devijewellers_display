const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf-8');

const oldInterval = `      const durationSeconds =
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
      }, 1000);`;

const newInterval = `      const isVideo = currentMediaItem.type === "video" || 
        currentMediaItem.url.match(/\\.(mp4|webm|mov)$/i) || 
        currentMediaItem.url.startsWith("data:video");

      if (isVideo) {
        // For video, we don't use the static duration to auto-advance.
        // The advancement is handled by the video's onEnded event.
        // We just put a long fallback timeout (e.g. 5 minutes) in case the video stalls.
        let elapsed = 0;
        setMediaTimeRemaining(0); // Hide or ignore time remaining for videos
        intervalId = setInterval(() => {
          elapsed += 1;
          if (elapsed >= 300) { // 5 minutes max fallback
            setCurrentSignageMode("rates");
            setActiveMediaIndex((prev) => (prev + 1) % activeSignageMedia.length);
            clearInterval(intervalId);
          }
        }, 1000);
      } else {
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

code = code.replace(oldInterval, newInterval);

const oldVideo = `<video
                    key={currentItem.id}
                    src={currentItem.url}
                    className="w-full h-full object-contain bg-black"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />`;

const newVideo = `<video
                    key={currentItem.id}
                    src={currentItem.url}
                    className="w-full h-full object-contain bg-black"
                    autoPlay
                    muted
                    playsInline
                    onEnded={() => {
                      setCurrentSignageMode("rates");
                      setActiveMediaIndex((prev) => (prev + 1) % activeSignageMedia.length);
                    }}
                  />`;

code = code.replace(oldVideo, newVideo);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
console.log("Patched TVDisplay video handling");
