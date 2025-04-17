const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Start Next.js with color output preserved and capture its output
const nextDev = spawn("npm", ["run", "dev"], {
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});

// Function to start the preview server once we have the port
function startPreviewServer(port) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Next.js App at Different Resolutions</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: system-ui, -apple-system, sans-serif;
        }

        body {
            background-color: #1a1a1a;
            color: white;
            padding: 20px;
        }

        .container {
            max-width: 1920px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 40px;
        }

        .viewport {
            background: #2d2d2d;
            padding: 20px;
            border-radius: 8px;
        }

        .viewport-title {
            margin-bottom: 15px;
            font-size: 1.2em;
            color: #ff4500;
        }

        .frame-container {
            background: #fff;
            border-radius: 4px;
            overflow: hidden;
            resize: none;
            margin: 0 auto;
        }

        iframe {
            border: none;
            background: white;
        }

        .mobile-frame {
            width: 390px;
            height: 844px;
        }

        .desktop-frame {
            width: 1920px;
            height: 1080px;
            max-width: 100%;
            max-height: 80vh;
        }

        .ultrawide-frame {
            width: 3440px;
            height: 1440px;
            max-width: 100%;
            max-height: 80vh;
        }

        .stats {
            font-size: 0.9em;
            color: #888;
            margin-top: 10px;
        }

        .server-info {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4500;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 0.9em;
        }

        @media (max-width: 768px) {
            body {
                padding: 10px;
            }

            .viewport {
                padding: 10px;
            }

            .mobile-frame {
                width: 100%;
                height: 600px;
            }
        }
    </style>
</head>
<body>
    <div class="server-info">
        Next.js server running on port: ${port}
    </div>
    <div class="container">
        <div class="viewport">
            <h2 class="viewport-title">Mobile View (iPhone 13)</h2>
            <div class="frame-container mobile-frame">
                <iframe 
                    sandbox="allow-same-origin allow-scripts"
                    width="390" 
                    height="844"
                    title="Mobile View"
                    srcdoc="
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'>
                            <style>
                                html, body { margin: 0; height: 100%; overflow: hidden; }
                                iframe { width: 100%; height: 100%; border: 0; }
                            </style>
                        </head>
                        <body>
                            <iframe src='http://localhost:${port}' width='390' height='844'></iframe>
                        </body>
                    </html>
                    ">
                </iframe>
            </div>
            <div class="stats">Resolution: 390 x 844 • Aspect Ratio: 19.5:9</div>
        </div>

        <div class="viewport">
            <h2 class="viewport-title">Desktop View (16:9)</h2>
            <div class="frame-container desktop-frame">
                <iframe 
                    sandbox="allow-same-origin allow-scripts"
                    width="1920" 
                    height="1080"
                    title="Desktop View"
                    srcdoc="
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta name='viewport' content='width=1920'>
                            <style>
                                html, body { margin: 0; height: 100%; overflow: hidden; }
                                iframe { width: 100%; height: 100%; border: 0; }
                            </style>
                        </head>
                        <body>
                            <iframe src='http://localhost:${port}' width='1920' height='1080'></iframe>
                        </body>
                    </html>
                    ">
                </iframe>
            </div>
            <div class="stats">Resolution: 1920 x 1080 • Aspect Ratio: 16:9</div>
        </div>

        <div class="viewport">
            <h2 class="viewport-title">Ultrawide View (21:9)</h2>
            <div class="frame-container ultrawide-frame">
                <iframe 
                    sandbox="allow-same-origin allow-scripts"
                    width="3440" 
                    height="1440"
                    title="Ultrawide View"
                    srcdoc="
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta name='viewport' content='width=3440'>
                            <style>
                                html, body { margin: 0; height: 100%; overflow: hidden; }
                                iframe { width: 100%; height: 100%; border: 0; }
                            </style>
                        </head>
                        <body>
                            <iframe src='http://localhost:${port}' width='3440' height='1440'></iframe>
                        </body>
                    </html>
                    ">
                </iframe>
            </div>
            <div class="stats">Resolution: 3440 x 1440 • Aspect Ratio: 21:9</div>
        </div>
    </div>

    <script>
        function adjustIframes() {
            const containers = document.querySelectorAll('.frame-container');
            containers.forEach(container => {
                const iframe = container.querySelector('iframe');
                const scale = Math.min(
                    container.clientWidth / iframe.width,
                    container.clientHeight / iframe.height
                );
                
                iframe.style.transform = "scale(" + scale + ")";
                iframe.style.transformOrigin = 'top left';
                container.style.height = iframe.height * scale + "px";
            });
        }

        window.addEventListener('load', adjustIframes);
        window.addEventListener('resize', adjustIframes);
    </script>
</body>
</html>`;

  // Create a temporary directory for preview files
  const previewDir = path.join(process.cwd(), ".preview-tmp");
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir);
  }

  // Write the HTML file to the temp directory
  const previewFilePath = path.join(previewDir, "index.html");
  fs.writeFileSync(previewFilePath, html);
  console.log("Generated preview HTML file at", previewFilePath);

  // Start the preview server
  const previewPort = 3456;
  console.log(`Starting preview server on port ${previewPort}...`);

  const serve = spawn(
    "npx",
    ["serve", previewDir, "-p", previewPort.toString()],
    {
      shell: true,
      stdio: "inherit",
    }
  );

  // Wait a bit before opening the browser to ensure server is running
  setTimeout(() => {
    console.log(`Opening preview in browser: http://localhost:${previewPort}`);
    spawn("npx", ["open-cli", `http://localhost:${previewPort}`], {
      shell: true,
      stdio: "inherit",
    });
  }, 1000);

  // Handle serve process termination
  serve.on("error", (error) => {
    console.error("Preview server error:", error);
  });
}

// Forward Next.js output directly to console with colors preserved
nextDev.stdout.on("data", (data) => {
  const output = data.toString();
  process.stdout.write(output);

  // Look for the port number in Next.js output
  const portMatch = output.match(/- Local:\s+http:\/\/localhost:(\d+)/);

  if (portMatch) {
    const port = portMatch[1];
    console.log(`\n[Preview] Detected Next.js running on port ${port}`);
    startPreviewServer(port);
  }
});

nextDev.stderr.on("data", (data) => {
  process.stderr.write(data.toString());
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\nShutting down servers...");
  nextDev.kill();
  process.exit();
});
