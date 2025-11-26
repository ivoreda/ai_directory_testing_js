import {sql} from "../config/db"

export class ToolRepository {
    async getToolsAsync(){
        return await sql`SELECT * FROM tools`;
    }

    async getToolByIdAsync(toolId:string){
        const tools = await sql`SELECT * FROM tools WHERE id = ${toolId}`;
        return tools[0];
    }

    async addToolAsync(toolData:any){
        const result = await sql`INSERT INTO tools (name, description, url, category, tags, pricing) VALUES (${toolData.name}, ${toolData.description}, ${toolData.url}, ${toolData.category}, ${toolData.tags}, ${toolData.pricing}) RETURNING *`;
        return result[0];
    }

    async updateToolAsync(toolId:string, toolData:any){
        const result = await sql`UPDATE tools SET name = ${toolData.name}, description = ${toolData.description}, icon = ${toolData.icon}, link = ${toolData.link} WHERE id = ${toolId} RETURNING *`;
        return result[0];
    }

    async markToolAsEmbeddedAsync(toolId: string){
        await sql`UPDATE tools SET isEmbedded = true WHERE id = ${toolId}`;
    }


    async deleteToolAsync(toolId:string){
        await sql`DELETE FROM tools WHERE id = ${toolId}`;
    }
}