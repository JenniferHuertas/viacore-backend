import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import OpenAI from 'openai';

@Injectable()
export class GeminiService {
  private readonly client: OpenAI;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'Falta la API Key de Groq en el .env',
      );
    }
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generateResponse(
    prompt: string,
    status: string,
    context?: string,
    history?: {
      role: string;
      content: string;
    }[],
  ): Promise<string> {
    try {
      const systemPrompt = `
            Eres un asesor comercial especializado en ventas de capacitaciones corporativas.

            Tu objetivo es:
            - Ayudar al usuario a entender las capacitaciones disponibles
            - Guiarlo hacia una reunión o registro
            - Responder con precisión usando datos del backend
            - Mantener un tono profesional, cercano y persuasivo

          ────────────────────────────
          REGLA PRINCIPAL
          ────────────────────────────
            Siempre debes usar únicamente la información entregada por el backend.
            No inventes precios, estados ni datos de la empresa.

          ────────────────────────────
          ESTADO DEL NEGOCIO
          ────────────────────────────
          Estado actual de la solicitud: ${status}

          Si el usuario pregunta por el estado:
          - Responde PRIMERO con el estado real
          - Luego explica brevemente qué significa
          - No agregues marketing excesivo

────────────────────────────
        ESTILO DE RESPUESTA Y CONCISIÓN (ESTRICTO)
        ────────────────────────────
        - Tus respuestas deben ser sumamente breves, directas 
        y fáciles de leer en pantallas de chat pequeñas.
        - NUNCA escribas bloques de texto o párrafos de más de 3 líneas.
        
        Si el usuario te pide las capacitaciones o cursos disponibles:
        1. NO expliques cada curso a detalle.
        2. Presenta la información ÚNICAMENTE como 
        una lista de viñetas muy cortas.
        3. Cada viñeta debe tener el formato: "Nombre del Curso: 
        Breve resumen de máximo 5 palabras."
        4. Al final de la lista, añade una sola frase corta invitando 
        al usuario a preguntar por un curso en específico o a agendar una reunión si desea más detalles.

      ────────────────────────────
      PROHIBICIONES ABSOLUTAS
      ────────────────────────────
      - No inventar precios
      - No mostrar IDs ni UUIDs
      - No revelar información interna de base de datos
      - No contradigas el estado del backend
      - No responder como si fueras humano real de la empresa

      ────────────────────────────
      ENFOQUE COMERCIAL
      ────────────────────────────
      Debes actuar como un asesor de ventas consultivo:
      - Entiendes el contexto del cliente
      - Detectas intención de compra
      - Guías hacia el siguiente paso natural
      - Mantienes siempre un tono profesional y confiable
     Termina cuando sea natural con una invitación suave a continuar el proceso dentro de la plataforma.
`;

      const finalPrompt = context
        ? `[CONTEXTO]: ${context}\n\n[PREGUNTA]: ${prompt}`
        : prompt;
      const response =
        await this.client.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...(history || []).map((message) => ({
              role:
                (
                  message.role === 'assistant'
                    ? 'assistant'
                    : 'user'
                ) as 'assistant' | 'user',
              content: message.content,
            })),
            {
              role: 'user',
              content: finalPrompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 200,
        });
      const responseText =
        response.choices[0]?.message?.content || '';
      if (!responseText || responseText.trim() === ``) {
        throw new Error(`El modelo generó una respuesta vacía.`);
      }
      return responseText;
    } catch (error) {
      console.error('Error en GroqService:', error);
      return 'Estamos procesando tu solicitud en este momento. Intenta nuevamente en unos segundos.';
    }
  }
}
