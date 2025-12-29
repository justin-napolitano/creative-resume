import fs from 'fs/promises';
import path from 'path';
import process from 'process';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const resumePath = path.join(__dirname, '../src/data/resume.json');
const outputPath = path.join(__dirname, '../src/data/experience-skills.json');

const args = process.argv.slice(2);
const params = Object.fromEntries(
  args.map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    return [key, value ?? 'true'];
  })
);

const model = params.model || 'gpt-4o-mini';
const force = params.force === 'true';
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Missing OPENAI_API_KEY environment variable.');
  process.exit(1);
}

const systemPrompt = `You help summarize experience entries into concrete skills.
For each experience, output exactly 13 skills.
Each skill needs:
- name: concise (max 3 words) and specific.
- summary: short phrase describing impact.
- tags: up to 3 short tags.
Respond with JSON matching:
{
  "experienceId": "string",
  "skills": [
    { "name": "", "summary": "", "tags": ["", ""] },
    ... 13 items ...
  ]
}`;

async function generateSkills(payload) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: payload },
      ],
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error: ${detail}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content from OpenAI');
  return JSON.parse(content);
}

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'experience';

async function main() {
  const raw = await fs.readFile(resumePath, 'utf-8');
  const resume = JSON.parse(raw);
  const experiences = resume.experience ?? [];
  let current = [];
  try {
    const existing = await fs.readFile(outputPath, 'utf-8');
    current = JSON.parse(existing);
  } catch (error) {
    current = [];
  }
  const existingMap = new Map(current.map((entry) => [entry.experienceId, entry]));
  const updated = [];
  for (const experience of experiences) {
    if (!force && existingMap.get(experience.id)?.skills?.length === 13) {
      updated.push(existingMap.get(experience.id));
      continue;
    }
    const prompt = `Experience ID: ${experience.id}\nTitle: ${experience.title}\nCompany: ${experience.company}\nLocation: ${experience.location}\nDates: ${experience.start} – ${experience.end}\nBullets:\n${(experience.bullets ?? []).map((bullet, idx) => `${idx + 1}. ${bullet}`).join('\n')}\nTechnologies: ${(experience.technologies ?? []).join(', ')}`;
    console.log(`Generating skills for ${experience.title} @ ${experience.company}`);
    const result = await generateSkills(prompt);
    updated.push({
      experienceId: experience.id,
      slug: slugify(experience.id),
      title: experience.title,
      company: experience.company,
      skills: result.skills ?? [],
    });
  }
  await fs.writeFile(outputPath, JSON.stringify(updated, null, 2));
  console.log(`Experience skills saved to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
