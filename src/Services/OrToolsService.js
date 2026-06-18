import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const solveUsingORTools = (data) => {
    return new Promise((resolve, reject) => {

        const pythonFile = path.join(__dirname, "../python/solver.py");

        console.log("🚀 Running Python Solver:", pythonFile);

        // IMPORTANT: use python3 for production compatibility
        const python = spawn(process.env.PYTHON || "python", [pythonFile]);

        let output = "";
        let error = "";

        // -------------------------
        // STDOUT
        // -------------------------
        python.stdout.on("data", (chunk) => {
            output += chunk.toString();
        });

        // -------------------------
        // STDERR (debug logs from Python)
        // -------------------------
        python.stderr.on("data", (chunk) => {
            error += chunk.toString();
        });

        // -------------------------
        // TIMEOUT (VERY IMPORTANT)
        // -------------------------
        const timeout = setTimeout(() => {
            console.error("⛔ Python solver timeout");
            python.kill("SIGKILL");
            reject(new Error("Solver timeout"));
        }, 60000);

        // -------------------------
        // CLOSE EVENT
        // -------------------------
        python.on("close", (code) => {
            clearTimeout(timeout);

            console.log("🔚 Exit Code:", code);

            if (error) {
                console.log("🐛 STDERR:");
                console.log(error);
            }

            if (output) {
                console.log("📦 STDOUT:");
                console.log(output);
            }

            // If Python crashed
            if (code !== 0) {
                return reject(new Error(error || "Python solver failed"));
            }

            // If no output
            if (!output.trim()) {
                return reject(new Error("Empty output from Python solver"));
            }

            try {
                const result = JSON.parse(output.trim());
                resolve(result);
            } catch (err) {
                console.error("❌ JSON Parse Error");
                console.error("Raw Output:", output);
                reject(err);
            }
        });

        // -------------------------
        // SAFE STDIN WRITE
        // -------------------------
        try {
            python.stdin.write(JSON.stringify(data));
            python.stdin.end();
        } catch (err) {
            reject(err);
        }
    });
};
