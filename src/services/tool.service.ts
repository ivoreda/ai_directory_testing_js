import { ToolRepository } from "../repository/tool.repository";
import { ToolDto } from "../dtos/tool.dto";

export class ToolService {
    private readonly toolRepository: ToolRepository;

    constructor() {
        this.toolRepository = new ToolRepository();
    }
    async getTools(){
        return await this.toolRepository.getToolsAsync();
    }

    async getToolById(toolId:string){
        return await this.toolRepository.getToolByIdAsync(toolId);
    }

    async addTool(toolData:ToolDto){
        return await this.toolRepository.addToolAsync(toolData);
    }

    async updateTool(toolId:string, toolData:ToolDto){
        return await this.toolRepository.updateToolAsync(toolId, toolData);
    }

    async deleteTool(toolId:string){
        return await this.toolRepository.deleteToolAsync(toolId);
    }

    
}