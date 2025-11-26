import { ToolRepository } from "../repository/tool.repository";
import { ToolDto } from "../dtos/tool.dto";
import {ragService} from "./rag.service";

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

    async markToolAsEmbedded(toolId: string){
        return await this.toolRepository.markToolAsEmbeddedAsync(toolId);
    }

    async queryTools(query: string){
        return await ragService.queryTools(query);
    }


    async deleteTool(toolId:string){
        return await this.toolRepository.deleteToolAsync(toolId);
    }

    
}