// content.js - Cross-browser compatible code
(function () {
  function initVideoControls() {
    // Find all video elements on the page
    const videos = document.getElementsByTagName('video');

    if (videos.length === 0) {
      // No videos found yet, check again later
      setTimeout(initVideoControls, 1000);
      return;
    }

    // Remove any existing listeners to prevent duplicates
    if (window._videoKeyListener) {
      document.removeEventListener('keydown', window._videoKeyListener, true);
    }

    // Create our listener function
    window._videoKeyListener = function (event) {
      // Only proceed if we're not in an input field or textarea
      if (event.target.matches('input, textarea, [contenteditable]')) {
        return;
      }

      // Amount to seek (in seconds)
      const SEEK_AMOUNT = 5;
      let handled = false;

      // Apply to all videos on the page
      Array.from(videos).forEach((video) => {
        switch (event.key.toLowerCase()) {
          case 'k':
            // Toggle play/pause
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
            handle = true;
            break;
          case 'l':
            // Fast forward
            if (video.duration) {
              // Check if duration is available
              video.currentTime = Math.min(
                video.duration,
                video.currentTime + SEEK_AMOUNT
              );
              handled = true;
            }
            break;
          case 'j':
            // Rewind
            video.currentTime = Math.max(0, video.currentTime - SEEK_AMOUNT);
            handled = true;
            break;
          case 'f':
            // Toggle fullscreen
            if (!document.fullscreenElement) {
              video.requestFullscreen().catch((err) => {
                console.warn(
                  `Error: Unable to open fullscreen: ${err.message}`
                );
              });
            } else {
              document.exitFullscreen();
            }
        }
      });

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Add keyboard event listener to the document with capture phase
    document.addEventListener('keydown', window._videoKeyListener, true);

    // Add mutation observer to handle dynamically added videos
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          const hasNewVideos = Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeName === 'VIDEO' ||
              (node.getElementsByTagName &&
                node.getElementsByTagName('video').length > 0)
          );
          if (hasNewVideos) {
            initVideoControls();
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Start the initialization process
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoControls);
  } else {
    initVideoControls();
  }
})();
