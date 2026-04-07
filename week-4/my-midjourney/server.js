const express = require('express');
const path = require('path');

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const FAL_KEY = (process.env.FAL_KEY || 'cce38097-cfca-47a3-9d86-c595f0a8b6a8:76f7ec92626372e193fba9199a924f41').trim();
const FAL_ENDPOINT = 'https://fal.run/fal-ai/z-image';

const ASPECT_TO_IMAGE_SIZE = {
  '1:1': 'square_hd',
  '16:9': 'landscape_16_9',
  '9:16': 'portrait_16_9',
  '4:3': 'landscape_4_3',
  '3:4': 'portrait_4_3',
};

function buildPrompt(prompt, style) {
  const trimmed = (prompt || '').trim();
  if (style && style.toLowerCase() !== 'none' && style.toLowerCase() !== 'default') {
    return `[${style} style] ${trimmed}`;
  }
  return trimmed;
}

app.post('/api/generate', async (req, res) => {
  try {
    const {
      prompt,
      style,
      aspectRatio,
      stylize,
      quality,
      chaos,
      version,
    } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'prompt is required',
      });
    }

    const image_size = ASPECT_TO_IMAGE_SIZE[aspectRatio] || 'square_hd';
    const finalPrompt = buildPrompt(prompt, style);

    const falResponse = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        image_size,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text().catch(() => '');
      console.error('fal.ai error:', falResponse.status, errText);
      return res.status(502).json({
        success: false,
        message: `Image generation failed (${falResponse.status})`,
      });
    }

    const result = await falResponse.json();
    const imageUrl = result?.images?.[0]?.url || null;

    if (!imageUrl) {
      return res.status(502).json({
        success: false,
        message: 'No image returned from generator',
      });
    }

    return res.json({
      success: true,
      data: {
        imageUrl,
        prompt: finalPrompt,
        originalPrompt: prompt,
        style: style || null,
        aspectRatio: aspectRatio || '1:1',
        imageSize: image_size,
        stylize: stylize ?? null,
        quality: quality ?? null,
        chaos: chaos ?? null,
        version: version ?? null,
        seed: result?.seed ?? null,
      },
    });
  } catch (err) {
    console.error('POST /api/generate failed:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Internal server error',
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`my-midjourney server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
