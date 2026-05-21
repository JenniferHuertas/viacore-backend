import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('Falta la API Key de Géminis en el archivo .env');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `
        Eres el asistente virtual de Viacore. 
        Tu objetivo es ayudar a los usuarios con 
        servicios de capacitación y cotizaciones.
        
        REGLAS DE ORO:
        1. Si el contexto indica que el usuario es ANÓNIMO:
           - No puedes dar detalles privados.
           - Invítalo amablemente a iniciar sesión o registrarse
            para ver cotizaciones.
           - Explica que para pedir una cotización 
           primero debe elegir un servicio.
        2. Si el usuario está LOGUEADO pero NO TIENE cotizaciones:
           - Confirma que ya es parte de la plataforma.
           - Explica los pasos para solicitar su primera cotización.
        3. Si el usuario tiene COTIZACIONES:
           - Usa la información proporcionada para responder sus dudas.
        4. Siempre sé proactivo, amable y profesional.
      `,
    });
    const finalPrompt = context 
      ? `CONTEXTO DEL SISTEMA: ${context}\n\nPREGUNTA DEL USUARIO: ${prompt}`
      : prompt;
    const result = await model.generateContent(finalPrompt);
    return result.response.text();
  }
}