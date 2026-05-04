import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const apiKey = process.env.OPENAI_API_KEY;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const inputFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(scriptDir, "subs.txt");
const model = process.argv[3] || process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!apiKey) {
  console.error(
    "Defina OPENAI_API_KEY no ambiente antes de executar este script.",
  );
  process.exit(1);
}

const instructions = [
  "Act as an active study expert. Your task is to create a high-quality quiz based on the provided video transcription.",
  "MANDATORY RULES:",
  "1. Respond ONLY with pure JSON. Do not include markdown (```json), comments, or explanations.",
  "2. The language of questions and answers must be the same as the transcription.",
  "3. Generate at least 3 objective and challenging questions.",
  "4. Each question must have exactly 4 alternatives.",
  "5. The 'answer' field must contain ONLY the letter (A, B, C, or D) or index (0, 1, 2, or 3) of the correct alternative.",
  "6. DO NOT put the full alternative text in the 'answer' field, only the letter or number.",
  "",
  "OUTPUT FORMAT:",
  '[{"question":"Question here?","alternatives":["Alternative A","Alternative B","Alternative C","Alternative D"],"answer":"A"}]',
].join("\n");

const quizSchema = {
  type: "array",
  minItems: 3,
  items: {
    type: "object",
    additionalProperties: false,
    properties: {
      question: { type: "string" },
      alternatives: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: { type: "string" },
      },
      answer: { type: "string" },
    },
    required: ["question", "alternatives", "answer"],
  },
};
const subs = fs.readFileSync(inputFile, "utf8");

async function generateQuiz(transcription) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: transcription,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "active_study_quiz",
          strict: true,
          schema: quizSchema,
        },
      },
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || `OpenAI API error: ${response.status}`,
    );
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("A OpenAI nao retornou conteudo.");

  return JSON.parse(content);
}

generateQuiz(subs)
  .then((quiz) => console.log(JSON.stringify(quiz, null, 2)))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
