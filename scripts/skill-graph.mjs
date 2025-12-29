import fs from 'fs/promises';
import path from 'path';
import process from 'process';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const resumePath = path.join(__dirname, '../src/data/resume.json');
const defaultOutputPath = path.join(__dirname, '../public/skill-graph.json');

const args = process.argv.slice(2);
const params = Object.fromEntries(
  args.map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    return [key, value ?? 'true'];
  })
);

const stackLabels = {
  warehousing: 'Warehousing',
  deployment: 'Deployment',
  insights: 'Insights',
  general: 'General',
};

const taxonomy = [
  {
    stack: 'warehousing',
    label: 'Warehousing',
    descriptor: 'Lakehouses, ELT frameworks, SQL pipelines, reproducible analytics, and governed data models.',
  },
  {
    stack: 'deployment',
    label: 'Deployment',
    descriptor: 'Cloud engineering, runtime platforms, CI/CD, infrastructure as code, and automation tooling.',
  },
  {
    stack: 'insights',
    label: 'Insights',
    descriptor: 'Analytics activation, BI platforms, experimentation, graph analysis, AI systems, and human-facing insights.',
  },
];

const BADGE_CHAR_LIMIT = 'SEGMENT + FIVETRAN'.length;
const skillBadgeOverrides = {
  'Infrastructure as Code': 'Infra + Code',
  'Serverless Platforms': 'Serverless Ops',
  'Algorithms and Statistics': 'Algorithms & Stats',
  'Algorithms & Stats': 'Algorithms & Stats',
  'Data Science Platforms': 'Data Sci Platforms',
};

const shortenWord = (word = '') => {
  if (word.length <= 4) return word;
  return `${word.slice(0, 4)}.`;
};

const fallbackInitials = (words = []) =>
  words
    .map((word) => (word ? `${word[0].toUpperCase()}.` : ''))
    .join(' ')
    .trim();

const friendlySkillLabel = (name = '') => {
  if (!name) return name;
  if (skillBadgeOverrides[name]) return skillBadgeOverrides[name];
  if (name.length <= BADGE_CHAR_LIMIT) return name;
  const words = name.split(/\s+/);
  let shortened = words.map(shortenWord).join(' ');
  if (shortened.length <= BADGE_CHAR_LIMIT) return shortened;
  const initials = fallbackInitials(words);
  if (initials.length > 0 && initials.length <= BADGE_CHAR_LIMIT) return initials;
  return name.slice(0, BADGE_CHAR_LIMIT - 1) + '…';
};

const includeHidden = params.hidden === 'true';
const model = params.model || 'text-embedding-3-small';
const outputPath = params.output ? path.resolve(process.cwd(), params.output) : defaultOutputPath;

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY environment variable.');
  process.exit(1);
}

function meanVector(vectors) {
  const length = vectors[0].length;
  const avg = new Array(length).fill(0);
  vectors.forEach((vec) => {
    for (let i = 0; i < length; i += 1) {
      avg[i] += vec[i];
    }
  });
  return avg.map((value) => value / vectors.length);
}

function multiplyMatrixVector(matrix, vector) {
  return matrix.map((row) => row.reduce((sum, value, idx) => sum + value * vector[idx], 0));
}

function powerIterationSymmetric(matrix, iterations = 100) {
  const n = matrix.length;
  if (n === 0) return null;
  let b = Array.from({ length: n }, () => Math.random() - 0.5);
  let norm = Math.hypot(...b);
  if (!norm) b[0] = 1;
  else b = b.map((value) => value / norm);
  let eigenvalue = 0;
  for (let iter = 0; iter < iterations; iter += 1) {
    const next = multiplyMatrixVector(matrix, b);
    norm = Math.hypot(...next);
    if (!norm) break;
    b = next.map((value) => value / norm);
    const mb = multiplyMatrixVector(matrix, b);
    eigenvalue = b.reduce((sum, value, idx) => sum + value * mb[idx], 0);
  }
  return { value: eigenvalue, vector: b };
}

function project2D(vectors) {
  const n = vectors.length;
  const dims = vectors[0]?.length ?? 0;
  if (!n || !dims) return vectors.map(() => ({ x: 0, y: 0 }));
  const mean = new Array(dims).fill(0);
  vectors.forEach((vec) => {
    for (let i = 0; i < dims; i += 1) mean[i] += vec[i];
  });
  mean.forEach((value, idx) => {
    mean[idx] = value / n;
  });
  const centered = vectors.map((vec) => vec.map((value, idx) => value - mean[idx]));
  const gram = centered.map((rowI) => centered.map((rowJ) => rowI.reduce((sum, value, idx) => sum + value * rowJ[idx], 0)));
  const components = [];
  let matrix = gram.map((row) => [...row]);
  for (let i = 0; i < Math.min(2, n); i += 1) {
    const result = powerIterationSymmetric(matrix, 150);
    if (!result) break;
    const { value, vector } = result;
    if (!Number.isFinite(value)) break;
    components.push({ value, vector: [...vector] });
    // deflate
    for (let r = 0; r < n; r += 1) {
      for (let c = 0; c < n; c += 1) {
        matrix[r][c] -= value * vector[r] * vector[c];
      }
    }
  }
  while (components.length < 2) {
    components.push({ value: 0, vector: new Array(n).fill(0) });
  }
  return centered.map((_, idx) => ({
    x: components[0].vector[idx] * Math.sqrt(Math.max(components[0].value, 0)),
    y: components[1].vector[idx] * Math.sqrt(Math.max(components[1].value, 0)),
  }));
}

async function embedTexts(texts) {
  const chunks = [];
  const chunkSize = 64;
  for (let i = 0; i < texts.length; i += chunkSize) {
    chunks.push(texts.slice(i, i + chunkSize));
  }
  const embeddings = [];
  for (const chunk of chunks) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input: chunk }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OpenAI error: ${detail}`);
    }
    const data = await response.json();
    data.data.forEach((item) => embeddings.push(item.embedding));
  }
  return embeddings;
}

const SLUG_REGEX = /[^a-z0-9]+/g;
const slugify = (value = '') => value.toLowerCase().trim().replace(SLUG_REGEX, '-').replace(/^-+|-+$/g, '') || 'section';

const cosineSimilarity = (a, b) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const buildAreaContext = (area) => {
  const itemText = (area.items ?? [])
    .map((item) => `${item.name} ${(item.tags ?? []).join(' ')}`)
    .join('; ');
  return `${area.area}. ${area.category ?? ''}. ${itemText}`;
};

const classifyStack = (embedding, fallback = 'insights') => {
  let best = null;
  let bestScore = -Infinity;
  taxonomy.forEach((entry) => {
    const score = cosineSimilarity(embedding, entry.embedding ?? []);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });
  const stack = best?.stack ?? fallback;
  return { stack, stackLabel: best?.label ?? stackLabels[stack] ?? stack };
};

async function main() {
  const raw = await fs.readFile(resumePath, 'utf-8');
  const resume = JSON.parse(raw);
  const resumeAreas = resume.skills ?? [];

  const taxonomyEmbeddings = await embedTexts(taxonomy.map((entry) => entry.descriptor));
  taxonomy.forEach((entry, idx) => {
    entry.embedding = taxonomyEmbeddings[idx];
  });

  const areaContexts = resumeAreas.map((area) => ({ area, context: buildAreaContext(area) }));
  const areaEmbeddings = areaContexts.length > 0 ? await embedTexts(areaContexts.map((ctx) => ctx.context)) : [];

  const areas = areaContexts.map((ctx, index) => {
    const embedding = areaEmbeddings[index] ?? [];
    const manualStack = ctx.area.stack;
    const stackMeta = manualStack && stackLabels[manualStack]
      ? { stack: manualStack, stackLabel: stackLabels[manualStack] }
      : classifyStack(embedding);
    const categoryKey = ctx.area.categoryId ?? ctx.area.id ?? slugify(ctx.area.area);
    const categoryLabel = ctx.area.category ?? ctx.area.area;
    return {
      id: ctx.area.id ?? slugify(ctx.area.area),
      label: ctx.area.area,
      stack: stackMeta.stack,
      stackLabel: stackMeta.stackLabel,
      categoryKey,
      categoryLabel,
      items: ctx.area.items ?? [],
      clusterId: index,
    };
  });

  const skills = [];
  areas.forEach((area) => {
    area.items.forEach((item) => {
      if (!includeHidden && item.display === false) return;
      skills.push({
        id: `${area.id}:${item.name}`,
        area: area.label,
        areaId: area.id,
        category: area.categoryKey,
        categoryLabel: area.categoryLabel,
        stack: area.stack,
        stackLabel: area.stackLabel,
        clusterId: area.clusterId,
        name: item.name,
        badgeLabel: friendlySkillLabel(item.name ?? ''),
        level: item.level,
        years: item.years,
        tags: item.tags ?? [],
        text: `${item.name}. Area: ${area.label}. Stack: ${area.stackLabel}. Tags: ${(item.tags ?? []).join(', ')}. Level: ${item.level ?? 'n/a'}. Years: ${item.years ?? 'n/a'}`,
      });
    });
  });

  if (skills.length === 0) {
    console.error('No skills found to cluster.');
    process.exit(1);
  }

  const embeddings = await embedTexts(skills.map((skill) => skill.text));
  const coords = project2D(embeddings);
  const xs = coords.map((coord) => coord.x);
  const ys = coords.map((coord) => coord.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const skillPoints = skills.map((skill, idx) => ({
    ...skill,
    cluster: skill.clusterId,
    coord: coords[idx],
  }));

  const clusterList = areas.map((area) => {
    const members = skillPoints
      .map((skill, idx) => ({ skill, idx }))
      .filter(({ skill }) => skill.cluster === area.clusterId);
    const memberEmbeddings = members.map(({ idx }) => embeddings[idx]);
    const centroidSample = memberEmbeddings.length > 0 ? meanVector(memberEmbeddings).slice(0, 8) : [];
    return {
      id: area.clusterId,
      key: area.id,
      label: area.label,
      category: area.categoryKey,
      categoryLabel: area.categoryLabel,
      stack: area.stack,
      stackLabel: area.stackLabel,
      members: members.map(({ skill }) => ({ id: skill.id, name: skill.name, area: skill.area })),
      centroidSample,
    };
  });

  const clusterCount = clusterList.length;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        model,
        clusterCount,
        skills: skillPoints,
        clusters: clusterList,
        dimensions: ['pc1', 'pc2'],
        ranges: {
          x: { min: minX, max: maxX },
          y: { min: minY, max: maxY },
        },
      },
      null,
      2
    )
  );
  console.log(`Skill graph written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
