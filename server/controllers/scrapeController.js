import Scrape from '../models/ScrapeModel.js';
import fetch from 'node-fetch'; // ✅ Needed for Node < 18

export const createScrape = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId;
    const { input } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
    }

    const prompt = `
You are an expert data-extraction assistant.
== Input ==
${input}

== Instructions (return MARKDOWN) ==
1. If input is a URL, describe the page (title, author, date).
2. Extract key data / facts.
3. Explain what the data means in plain English.
4. Use headings, bullet lists, and code blocks when helpful.
`;

    let data, result;

    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY1,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }]
                }
              ]
            })
          }
        );
        console.log('[DEBUG] Gemini API Key in use:', process.env.GEMINI_API_KEY);
        
        data = await response.json();

        if (!response.ok) {
          // Retry if 503 from Gemini
          if (response.status === 503 && i < 2) {
            console.warn(`[Gemini Retry] 503 Service Unavailable. Attempt ${i + 1}/3`);
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }

          throw new Error(data.error?.message || 'Gemini content generation failed');
        }

        result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No result returned.';
        if (!result || result === 'No result returned.') {
          throw new Error('Gemini returned an empty result.');
        }

        break; // Success

      } catch (err) {
        const isRetryable =
          err.code === 'ECONNRESET' ||
          err.message?.toLowerCase().includes('timeout') ||
          err.message?.toLowerCase().includes('unavailable');

        if (i < 2 && isRetryable) {
          console.warn(`[Retryable Error] ${err.message} — Retrying... (${i + 1}/3)`);
          await new Promise((r) => setTimeout(r, 2000));
        } else {
          console.error('[Gemini Fetch Error]', err);
          return res.status(500).json({
            error: err.message || 'Gemini API is currently unavailable. Please try again later.',
          });
        }
      }
    }

    const [introBlock, ...analysisBlocks] = result.split('###');
    const intro = introBlock.trim();
    const analysis = analysisBlocks.join('###').trim();

    const scrape = await Scrape.create({
      userId: req.user.id,
      source: input,
      result,
      intro,
      analysis,
    });

    res.status(201).json(scrape);
  } catch (err) {
    next(err);
  }
};


// === Get Own AI Scrapes ===
export const getOwnAIScrapes = async (req, res) => {
 try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const scrapes = await Scrape.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json(scrapes); // Always return 200, even if empty []
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch scrapes', error: error.message });
  }
};

// === Get All AI Scrapes (Admin) ===
export const getAllAIScrapes = async (_req, res) => {
  try {
    const scrapes = await Scrape.find().populate('userId', 'username email');
    console.log('[Render] Found scrapes:', scrapes.length);
    res.json(scrapes);
  } catch (error) {
    console.error('[getAllAIScrapes ERROR]', error);
    res.status(500).json({ message: 'Failed to fetch all scrapes' });
  }
};
