// Vercel Serverless Function (Node 20)
// Receives a base64 image and returns a structured recipe via Gemini.
// Keeps GEMINI_API_KEY off the client — only the parsed JSON is exposed.

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

interface RequestBody {
  image?: string;
  mimeType?: string;
}

const RECIPE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    cuisine: { type: SchemaType.STRING },
    difficulty: {
      type: SchemaType.STRING,
      enum: ["easy", "medium", "hard"],
    },
    health_level: {
      type: SchemaType.STRING,
      enum: ["light", "balanced", "indulgent"],
    },
    prep_time_minutes: { type: SchemaType.INTEGER },
    cook_time_minutes: { type: SchemaType.INTEGER },
    servings: { type: SchemaType.INTEGER },
    yield_label: { type: SchemaType.STRING },
    ingredients: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    steps: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    tags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ["title", "ingredients", "steps"],
} as const;

const SYSTEM_PROMPT = `You extract structured recipes from photos of cookbook pages, handwritten cards, restaurant menus, or screenshots.

Rules:
- Always return valid JSON matching the provided schema.
- "ingredients" are bullet-style strings, each fully self-contained (qty + unit + item + prep), e.g. "2 cups all-purpose flour, sifted".
- "steps" are concise, imperative instructions, one per array entry, no leading numbers.
- "difficulty" is your best estimate from ingredient count and technique: easy / medium / hard.
- "health_level": light = vegetable-forward + lean protein + low added fat/sugar; balanced = mixed; indulgent = high in butter/sugar/fried/cheesy.
- Times in MINUTES (integers). If a range is given, take the midpoint. Omit if truly unknown.
- If the image clearly isn't a recipe, return a best-effort title of "Untitled recipe" and empty ingredient/step arrays.

Never invent steps not visible in the image. Prefer omission over fabrication.`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "GEMINI_API_KEY is not configured on the server.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { image, mimeType } = body;
  if (!image || !mimeType) {
    return new Response(
      JSON.stringify({ error: "Missing 'image' (base64) or 'mimeType'" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",

        // @ts-expect-error library types lag behind the responseSchema feature
        responseSchema: RECIPE_SCHEMA,
        temperature: 0.2,
      },
    });

    const result = await model.generateContent([
      { inlineData: { data: image, mimeType } },
      {
        text:
          "Extract the recipe shown in this image. Return JSON only — no prose, no markdown fences.",
      },
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown extraction error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = { runtime: "edge" };
