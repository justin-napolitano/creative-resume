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

const clusterCount = Number(params.clusters) || 6;
const includeHidden = params.hidden === 'true';
const model = params.model || 'text-embedding-3-small';
const outputPath = params.output ? path.resolve(process.cwd(), params.output) : defaultOutputPath;

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY environment variable.');
  process.exit(1);
}

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((token) => token && !['and', 'the', 'of', 'in', 'for'].includes(token));
}

function l2Distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
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

function kmeans(vectors, k, maxIterations = 50) {
  if (k > vectors.length) {
    throw new Error('Cluster count cannot exceed number of vectors');
  }
  const centroids = [];
  const usedIndexes = new Set();
  while (centroids.length < k) {
    const candidate = Math.floor(Math.random() * vectors.length);
    if (!usedIndexes.has(candidate)) {
      usedIndexes.add(candidate);
      centroids.push([...vectors[candidate]]);
    }
  }

  let assignments = new Array(vectors.length).fill(0);
  for (let iter = 0; iter < maxIterations; iter += 1) {
    let changed = false;
    assignments = assignments.map((clusterId, idx) => {
      const distances = centroids.map((centroid) => l2Distance(vectors[idx], centroid));
      const nextCluster = distances.indexOf(Math.min(...distances));
      if (nextCluster !== clusterId) changed = true;
      return nextCluster;
    });

    if (!changed) break;

    centroids.forEach((centroid, clusterIdx) => {
      const members = vectors.filter((_, idx) => assignments[idx] === clusterIdx);
      if (members.length > 0) {
        const mean = meanVector(members);
        for (let i = 0; i < centroid.length; i += 1) {
          centroid[i] = mean[i];
        }
      }
    });
  }

  return { assignments, centroids };
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

function deriveLabel(skills) {
  const frequency = new Map();
  skills.forEach((skill) => {
    tokenize(skill.name).forEach((token) => {
      frequency.set(token, (frequency.get(token) ?? 0) + 2);
    });
    (skill.tags ?? []).forEach((tag) => {
      tokenize(tag).forEach((token) => {
        frequency.set(token, (frequency.get(token) ?? 0) + 1);
      });
    });
  });
  const sorted = [...frequency.entries()].sort((a, b) => b[1] - a[1]);
  const primary = sorted[0]?.[0] ?? 'cluster';
  const secondary = sorted[1]?.[0];
  const friendlyMap = {
    sql: 'SQL systems',
    data: 'Data modeling',
    cloud: 'Cloud ops',
    snowflake: 'Warehouse ops',
    modeling: 'Modeling',
    testing: 'Testing',
    rag: 'AI / RAG',
    systems: 'Systems',
    python: 'Python flows',
  };
  const friendly = friendlyMap[primary];
  return friendly || [primary, secondary].filter(Boolean).join(' ');
}

async function main() {
  const raw = await fs.readFile(resumePath, 'utf-8');
  const resume = JSON.parse(raw);
  const skills = [];
  for (const area of resume.skills ?? []) {
    for (const item of area.items ?? []) {
      if (!includeHidden && item.display === false) continue;
      skills.push({
        id: `${area.id}:${item.name}`,
        area: area.area,
        name: item.name,
        level: item.level,
        years: item.years,
        tags: item.tags ?? [],
        text: `${item.name}. Area: ${area.area}. Tags: ${(item.tags ?? []).join(', ')}. Level: ${item.level ?? 'n/a'}. Years: ${item.years ?? 'n/a'}`,
      });
    }
  }
  if (skills.length === 0) {
    console.error('No skills found to cluster.');
    process.exit(1);
  }
  const embeddings = await embedTexts(skills.map((skill) => skill.text));
  const { assignments, centroids } = kmeans(embeddings, Math.min(clusterCount, skills.length));
  const coords = project2D(embeddings);
  const xs = coords.map((coord) => coord.x);
  const ys = coords.map((coord) => coord.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const clusters = new Map();
  skills.forEach((skill, idx) => {
    const clusterId = assignments[idx];
    if (!clusters.has(clusterId)) clusters.set(clusterId, []);
    clusters.get(clusterId).push({ ...skill, coord: coords[idx] });
  });

  const clusterList = [...clusters.entries()].map(([id, members]) => ({
    id,
    label: deriveLabel(members),
    members: members.map((skill) => ({ id: skill.id, name: skill.name, area: skill.area })),
    centroidSample: centroids[id]?.slice(0, 8) ?? [],
  }));

  const skillPoints = skills.map((skill, idx) => ({
    ...skill,
    cluster: assignments[idx],
    coord: coords[idx],
  }));

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        model,
        clusterCount: clusterList.length,
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
