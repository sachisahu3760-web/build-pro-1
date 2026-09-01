import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Helper to process image input whether base64 data URI, raw base64, or remote HTTP URL
async function prepareImageData(imageInput: string, defaultMimeType: string = 'image/jpeg') {
  let cleanBase64 = imageInput;
  let finalMimeType = defaultMimeType;

  if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    const fetchRes = await fetch(imageInput);
    if (!fetchRes.ok) {
      throw new Error(`Failed to fetch image from URL (${fetchRes.status}): ${fetchRes.statusText}`);
    }
    const contentType = fetchRes.headers.get('content-type');
    if (contentType && contentType.startsWith('image/')) {
      finalMimeType = contentType.split(';')[0];
    }
    const arrayBuffer = await fetchRes.arrayBuffer();
    cleanBase64 = Buffer.from(arrayBuffer).toString('base64');
  } else if (imageInput.startsWith('data:')) {
    const match = imageInput.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      finalMimeType = match[1];
      cleanBase64 = match[2];
    } else {
      cleanBase64 = imageInput.replace(/^data:[^;]+;base64,/, '');
    }
  } else {
    cleanBase64 = imageInput.replace(/^data:image\/\w+;base64,/, '').trim();
  }

  return {
    data: cleanBase64,
    mimeType: finalMimeType || 'image/jpeg',
  };
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Vision Hazard & Site Progress Photo Analysis
app.post('/api/gemini/analyze-site-photo', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', siteName, projectStage, promptText } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getGenAI();
    const imageData = await prepareImageData(imageBase64, mimeType);

    const prompt = `You are a Senior Construction Safety Inspector and Site Quality Engineer.
Analyze this construction site photo for:
1. Site Name / Stage context: ${siteName || 'Active Construction Site'} - ${projectStage || 'Ongoing Work'}.
${promptText ? `Specific instruction: ${promptText}` : ''}

Provide a structured JSON response with:
- "safetyScore": (number from 0 to 100)
- "ppeCompliance": {"helmets": boolean, "highVisVests": boolean, "safetyBoots": boolean, "fallProtection": boolean, "notes": string}
- "detectedHazards": list of objects { "type": string, "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL", "description": string, "recommendedAction": string }
- "workProgressEstimate": {"estimatedStage": string, "estimatedCompletionPct": number, "qualityObservations": string}
- "housekeepingStatus": "EXCELLENT" | "SATISFACTORY" | "POOR" | "HAZARDOUS"
- "summary": string (detailed 2-3 sentence overview for daily site diary)

Return pure JSON without markdown backticks if possible, or standard JSON inside markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageData.data,
                mimeType: imageData.mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { summary: responseText };
    }

    res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('Error analyzing site photo:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze photo' });
  }
});

// 3. High Thinking Schedule & Resource Optimizer (gemini-3.1-pro-preview with thinkingLevel HIGH)
app.post('/api/gemini/optimize-schedule-budget', async (req, res) => {
  try {
    const { projectData, weatherForecast, delayedTasks, budgetVariance, materialBottlenecks } = req.body;

    const ai = getGenAI();
    const prompt = `You are a Master Construction Operations Director with expertise in Critical Path Method (CPM), Lean Construction, Earned Value Management (EVM), and supply chain resilience.

Analyze this project state and produce an in-depth, mathematically sound recovery and optimization plan:
- Project: ${JSON.stringify(projectData || {})}
- Weather Forecast / Constraints: ${JSON.stringify(weatherForecast || {})}
- Delayed Tasks / Bottlenecks: ${JSON.stringify(delayedTasks || [])}
- Budget Variance & Spend: ${JSON.stringify(budgetVariance || {})}
- Material Stock Risks: ${JSON.stringify(materialBottlenecks || [])}

Provide:
1. Critical Path Analysis and delay compression strategies.
2. Resource leveling and labor shift rescheduling recommendations.
3. Material procurement expediting advice and local substitution alternatives.
4. Budget re-allocation and cost overrun containment actions.
5. 7-Day Action Plan for Site Supervisors.
6. Risk Matrix (Probability, Impact, Mitigation).

Respond in clean structured JSON format with keys:
{
  "criticalPathImpact": string,
  "scheduleOptimization": [{ "task": string, "action": string, "timeSavedDays": number, "resourceAdjustment": string }],
  "budgetRecoveryPlan": [{ "costCategory": string, "savingOpportunity": string, "potentialSavingUSD": number }],
  "materialRiskMitigation": [{ "material": string, "action": string, "supplierAlternative": string }],
  "sevenDayActionPlan": [{ "day": string, "milestone": string, "priority": "HIGH" | "MEDIUM" | "CRITICAL", "assignedRole": string }],
  "riskMatrix": [{ "risk": string, "severity": "HIGH" | "MEDIUM" | "LOW", "contingencyPlan": string }],
  "executiveSummary": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: 'HIGH' as any,
        },
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { executiveSummary: text };
    }

    res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error('Error optimizing schedule:', error);
    // Fallback to flash if pro preview has quota or delay
    try {
      const ai = getGenAI();
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide construction optimization JSON for: ${JSON.stringify(req.body)}`,
        config: { responseMimeType: 'application/json' },
      });
      res.json({ success: true, plan: JSON.parse(fallbackResponse.text || '{}') });
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message || 'Failed to optimize schedule' });
    }
  }
});

// 4. Grounded Construction Search & Building Codes (OSHA / National Building Code / IS Codes)
app.post('/api/gemini/safety-regulatory-search', async (req, res) => {
  try {
    const { query, jurisdiction = 'General / IS / OSHA' } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const ai = getGenAI();
    const prompt = `You are a Chief Compliance and Safety Officer for construction.
Query: "${query}"
Jurisdiction / Code standard context: ${jurisdiction}.
Provide accurate, up-to-date compliance requirements, safety standards, mandatory PPE, excavation/scaffolding guidelines, and checklist items based on verified standards.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    res.json({
      success: true,
      answer: response.text,
      sources: groundingMetadata?.groundingChunks || [],
      searchQueries: groundingMetadata?.webSearchQueries || [],
    });
  } catch (error: any) {
    console.error('Error searching safety codes:', error);
    res.status(500).json({ error: error.message || 'Failed to search compliance' });
  }
});

// 5. Maps Grounded Local Construction Material & Equipment Locator
app.post('/api/gemini/supplier-equipment-locator', async (req, res) => {
  try {
    const { location, materialType, radius = '25km' } = req.body;
    const ai = getGenAI();

    const prompt = `Find real construction material suppliers, ready-mix concrete (RMC) batching plants, steel TMT bar distributors, cement wholesalers, and heavy earthmoving equipment rental vendors near "${location || 'Mumbai, Maharashtra'}".
Looking for: ${materialType || 'General Construction Materials, Ready Mix Concrete, TMT Steel, Crane & JCB Rental'} within ${radius}.
List verified suppliers with addresses, service specialties, and logistics recommendations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    res.json({
      success: true,
      recommendations: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    });
  } catch (error: any) {
    console.error('Error finding suppliers:', error);
    res.status(500).json({ error: error.message || 'Failed to locate suppliers' });
  }
});

// 6. AI Translation & Regional Audio Briefing Generator
app.post('/api/gemini/translate-announcement', async (req, res) => {
  try {
    const { text, targetLanguages = ['hi', 'mr', 'ta', 'te', 'bn', 'gu', 'kn'] } = req.body;
    const ai = getGenAI();

    const prompt = `Translate this urgent construction safety / site bulletin announcement into colloquial, clear language for field workers:
Original text: "${text}"

Translate into:
- Hindi (हिन्दी)
- Odia (ଓଡ଼ିଆ)
- Marathi (मराठी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)

Provide JSON response with format:
{
  "hi": "...",
  "or": "...",
  "mr": "...",
  "ta": "...",
  "te": "...",
  "bn": "...",
  "gu": "...",
  "kn": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json({ success: true, translations: JSON.parse(response.text || '{}') });
  } catch (error: any) {
    console.error('Error translating announcement:', error);
    res.status(500).json({ error: error.message || 'Failed to translate' });
  }
});

// Single target language translation endpoint
app.post('/api/gemini/translate-multilingual', async (req, res) => {
  try {
    const { text, targetLanguage = 'or' } = req.body;
    const ai = getGenAI();

    const langNames: Record<string, string> = {
      hi: 'Hindi (हिन्दी)',
      or: 'Odia (ଓଡ଼ିଆ)',
      mr: 'Marathi (मराठी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      bn: 'Bengali (বাংলা)',
      gu: 'Gujarati (ગુજરાતી)',
      kn: 'Kannada (ಕನ್ನಡ)',
      en: 'English',
    };

    const targetLangName = langNames[targetLanguage] || targetLanguage;

    const prompt = `Translate this construction site instruction / safety directive accurately into ${targetLangName}:
Original text: "${text}"

Respond with ONLY the translated text without commentary or quotes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ success: true, translatedText: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Error in translate-multilingual:', error);
    res.status(500).json({ error: error.message || 'Failed to translate text' });
  }
});

// 7. Auto Daily Work Progress Report (DPR) Generation from Site Photo(s) & BOQ Scope
app.post('/api/gemini/generate-dpr-from-photo', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', siteName, dateStr, workOrders = [], weather = {} } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 photo is required to generate DPR' });
    }

    const ai = getGenAI();
    const imageData = await prepareImageData(imageBase64, mimeType);

    // Extract available BOQ items for matching
    const boqItemsSummary = workOrders.flatMap((wo: any) =>
      (wo.boqItems || []).map((b: any) => ({
        workOrderId: wo.id,
        contractorName: wo.contractorName,
        boqItemId: b.id,
        itemCode: b.itemCode,
        description: b.description,
        category: b.category,
        unit: b.unit,
        contractRate: b.contractRate,
        estimatedTotalQty: b.totalEstimatedQty,
        previouslyCompleted: b.completedQty,
      }))
    );

    const prompt = `You are a Senior Resident Engineer and Quantity Surveyor on site.
Analyze the uploaded construction site photo and generate a comprehensive, official Daily Progress Report (DPR).

Site Context:
- Site / Project: ${siteName || 'Construction Project'}
- Date: ${dateStr || new Date().toISOString().split('T')[0]}
- Weather: ${JSON.stringify(weather)}
- Available Work Orders & BOQ Rate Items for this project:
${JSON.stringify(boqItemsSummary, null, 2)}

Instructions:
1. Visually identify what structural / architectural / civil / MEP work is actively in progress or completed in this photo (e.g. formwork shuttering, rebar fixing, blockwork, concrete pour, plastering, excavation, scaffolding).
2. Match the visible work to the relevant BOQ items from the list above. If an item matches, estimate realistic quantities completed today based on visual cues (e.g. square meters of shuttering, metric tons of rebar, cubic meters of concrete, square feet of blockwork).
3. If no exact BOQ item matches, generate a realistic execution item with standard unit and rate.
4. Calculate today's earned gross revenue = todayExecutedQty * rate for each item.
5. Provide a professional engineering summary narrative of the day's work.
6. Evaluate PPE compliance, site safety conditions, housekeeping, and quality observations.
7. Provide AI DPR Insights including productivity score (0-100), detected activities, and actionable site bottlenecks.

Respond with strict JSON structure:
{
  "workDoneSummary": "Detailed 2-3 paragraph professional engineering summary of today's progress...",
  "progressByBOQ": [
    {
      "boqItemId": "boq-id-from-list",
      "workOrderId": "wo-id-from-list",
      "itemDescription": "Exact or specific description",
      "category": "Category",
      "unit": "Cu.M / Sq.M / MT / Sq.Ft / Rft",
      "rate": 1850,
      "todayExecutedQty": 12.5,
      "todayEarnedAmount": 23125,
      "locationOrGrid": "Pier 144 / Grid B / Floor 3",
      "qualityRating": "Good"
    }
  ],
  "totalTodayEarnedIncome": 65235,
  "safetyObservations": "Specific safety observations, worker PPE, fall protection, edge barricading...",
  "qualityObservations": "Slump test, alignment, cover block spacing, rebar tying tightness...",
  "aiDprInsights": {
    "structuralAssessment": "Observations on structural alignment, plumbness, and workmanship...",
    "productivityScore": 92,
    "detectedActivities": ["Activity 1", "Activity 2", "Activity 3"],
    "bottlenecksIdentified": ["Risk or bottleneck 1", "Material shortage warning"],
    "safetyScore": 95
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageData.data,
                mimeType: imageData.mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { workDoneSummary: text };
    }

    res.json({ success: true, dprData: parsed });
  } catch (error: any) {
    console.error('Error generating DPR from photo:', error);
    res.status(500).json({ error: error.message || 'Failed to generate DPR from site photo' });
  }
});

// Start server with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BuildPulse Pro Server running on port ${PORT}`);
  });
}

startServer();
