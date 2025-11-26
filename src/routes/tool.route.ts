import { ToolService } from '../services/tool.service';
import { ToolDto } from '../dtos/tool.dto';
import { eventEmitter } from '../events/emitters';

const toolService = new ToolService();

export default async function toolRoutes(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean); // e.g., ['tools', '123']

  try {
    // GET /tools
    if (request.method === 'GET' && pathSegments.length === 1 && pathSegments[0] === 'tools') {
      const tools = await toolService.getTools();
      return new Response(JSON.stringify(tools), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // GET /tools/:id
    if (request.method === 'GET' && pathSegments.length === 2 && pathSegments[0] === 'tools') {
      const tool = await toolService.getToolById(pathSegments[1]);
      if (!tool) {
        return new Response(JSON.stringify({ message: 'Tool not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify(tool), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // POST /tools
    if (request.method === 'POST' && url.pathname === '/tools') {
      const body: ToolDto = await request.json();

      // Ensure all required fields have a value before passing to the service.
      const toolData: ToolDto = {
        name: body.name,
        description: body.description,
        url: body.url,
        category: body.category,
        tags: body.tags ?? [], // Default to an empty array if tags is null or undefined
        pricing: body.pricing ?? 'Free', // Default to 'Free' if pricing is null or undefined
      };
      const newTool = await toolService.addTool(toolData);
      // emit event for new tool added so that bg worker takes the tool and embeds it
      eventEmitter.emit('newToolAdded', newTool);
      return new Response(JSON.stringify(newTool), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    // PUT /tools/:id
    if (request.method === 'PUT' && pathSegments.length === 2 && pathSegments[0] === 'tools') {
      const body = await request.json() as ToolDto;
      const updatedTool = await toolService.updateTool(pathSegments[1], body);
      return new Response(JSON.stringify(updatedTool), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // DELETE /tools/:id
    if (request.method === 'DELETE' && pathSegments.length === 2 && pathSegments[0] === 'tools') {
      await toolService.deleteTool(pathSegments[1]);
      return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(JSON.stringify({ message: 'Server Error', error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}