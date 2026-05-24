import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';


@Injectable()
export class GeminiService {
  private readonly client: OpenAI;
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;


    if (!apiKey) {
      throw new InternalServerErrorException(
        `Falta la API Key de Groq en el archivo .env`,
      );
    }


    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }


  async generateResponse(
    prompt: string,
    status: string = `ANONYMOUS`,
    context?: string,
    history?: {
      role: string;
      content: string;
    }[],
  ): Promise<string> {
    try {
      const systemPrompt = `
      Eres el asesor comercial de nuestra plataforma corporativa.
      Tu objetivo es vender soluciones de capacitación y
      guiar al usuario según el flujo real del negocio,
      e informar con honestidad y vender con ética.
      Tu tono debe ser corporativo, amable, formal, persuasivo,
      profesional, empatico y directo.


      REGLA DE ORO DE SEGURIDAD (ANTI-CORTES):
      - Tienes terminantemente PROHIBIDO escribir la palabra "Via".
      - Tienes terminantemente PROHIBIDO escribir la palabra "Viacore".
      - Si necesitas nombrar a la empresa o al panel, di siempre:
        "nuestra plataforma corporativa" o "tu portal de usuario".
      - Nunca dejes una oración incompleta. Desarrolla textos largos.


      REGLAS CRÍTICAS DE CONTROL DE DATOS (PROHIBICIONES):
      1. NUNCA escribas, repitas ni muestres ningún ID o UUID.
         Está prohibido imprimir códigos largos con guiones.
         Si ves un ID en el contexto, ignóralo por completo.


      2. PROHIBIDO INVENTAR COTIZACIONES O PRECIOS.
         No uses la imaginación con el dinero. Lee el [CONTEXTO].


      - El estado real de su solicitud es: "${status}".
        Recuerda actuar estrictamente bajo este estado actual.


      3. MONEDA REAL:
         Todos los precios están en Pesos Argentinos (ARS).


      - Si el estado de la solicitud es "pending":
      Explica que la solicitud se ha registrado con éxito.
      Menciona el "Precio Cotizado" del contexto explicando que es
      un monto estimado base calculado automáticamente.


      Aclara que NO es definitivo.


      Explica que el administrador revisará la solicitud
      y luego se coordinará una reunión estratégica.


     ARGUMENTACIÓN COMERCIAL DETALLADA:
     Usa los datos del sector y objetivos del usuario
     para explicar cómo nuestros talleres personalizados
     resolverán sus problemas reales.
     Termina invitándolo a coordinar la reunión
     desde su portal.
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
          max_tokens: 500,
        });


      const responseText =
        response.choices[0]?.message?.content || '';


      if (!responseText || responseText.trim() === ``) {
        throw new Error(`El modelo generó una respuesta vacía.`);
      }


      return responseText;
    } catch (error) {
      console.error(`Error en GeminiService:`, error);


      return (
        `¡Hola! He recibido tu consulta de forma exitosa. ` +
        `En este momento estoy procesando los detalles técnicos ` +
        `de tu solicitud, por lo que te pido un breve instante ` +
        `para mostrarte el estado actualizado. Mientras tanto, ` +
        `te invito a explorar las herramientas de tu perfil ` +
        `para coordinar tu próxima sesión comercial.`
      );
    }
  }
}
