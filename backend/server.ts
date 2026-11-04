import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
   console.log(`Listening on http://localhost:${PORT}/`);
   console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
   console.log(`OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
   console.log(`Health Check: http://localhost:${PORT}/api/v1/health`);
});
