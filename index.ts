import toolRoutes from './src/routes/tool.route';
import { absolutePath } from 'swagger-ui-dist';
import {eventEmitter} from './src/events/emitters';
import {Tool} from './src/models/Tool.model';
import { ragService } from './src/services/rag.service';
import { ToolService } from './src/services/tool.service';

const toolService = new ToolService();

console.log("Starting server...");

eventEmitter.on('newToolAdded', async (tool: Tool) => {
    console.log(`New tool added: ${tool.name} (ID: ${tool.id})`);

    try {
        await ragService.embedNewTool(tool);
    } catch (error) {
        console.error("Error embedding new tool:", error);
    }
    console.log(`Embedding process initiated for tool ID: ${tool.id}`);

});

const server = Bun.serve({
  async fetch(request) {
    const url = new URL(request.url);
    const { pathname } = url;

    // --- Swagger UI ---
    // Redirect /api-docs to /api-docs/index.html
    if (pathname === '/api-docs') {
      return Response.redirect(`${url.origin}/api-docs/index.html`, 302);
    }

    // Serve the openapi.json spec
    if (pathname === '/api-docs/openapi.json') {
        return new Response(Bun.file('./public/openapi.json'));
    }

    // Serve Swagger UI static files
    if (pathname.startsWith('/api-docs/')) {
        const filePath = pathname.replace('/api-docs/', '');
        const absolute = absolutePath();
        const file = Bun.file(`${absolute}/${filePath}`);
        return new Response(file);
    }
    // --- End Swagger UI ---

    // Route requests for '/tools' or '/tools/*' to the tool router
    if (url.pathname.startsWith('/tools')) {
      return toolRoutes(request);
    }

    // Handle other routes, e.g., the root path
    if (url.pathname === '/') {
        return new Response("Welcome to the AI Directory!");
    }

    // Fallback for routes that don't match
    return new Response(JSON.stringify({ message: "Not Found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  },
  port: 3000,
});

console.log(`Server listening on http://localhost:${server.port}`);
