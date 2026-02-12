# MiniMax M2.1 Integration Setup Guide

## 🚀 Why MiniMax for Bell24h?

- **Cost**: $0.30 per 1M tokens (8% of Claude Sonnet cost)
- **Multilingual**: Superior Hindi, Tamil, Telugu support
- **Context**: 128K-200K token window (handles long RFQs)
- **Agent-Native**: Multi-step reasoning for negotiations

---

## 📝 Step 1: Get MiniMax API Key

### Option A: Direct from MiniMax (Recommended)

1. **Visit**: https://api.minimax.chat
2. **Sign up** with email/phone
3. **Verify** account (SMS verification)
4. **Navigate to**: API Keys section
5. **Create new key**: "Bell24h Production"
6. **Copy** the API key (starts with `sk-...`)

### Option B: Through MiniMax China Platform

1. **Visit**: https://www.minimaxi.com
2. **注册账号** (Register account - Chinese)
3. **实名认证** (Identity verification)
4. **开通API服务** (Enable API service)
5. **获取密钥** (Get API key)

**Cost**: ~¥2/1M tokens (~₹25/1M tokens)

---

## 🔑 Step 2: Add API Key to Environment

### Local Development

Add to `.env.local`:

```env
# MiniMax AI Configuration
MINIMAX_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MINIMAX_BASE_URL=https://api.minimax.chat/v1
MINIMAX_MODEL=abab6.5-chat
```

### Production (DigitalOcean)

SSH into server and add to `.env.production`:

```bash
ssh root@165.232.187.195

# Add MiniMax keys
cat >> /var/www/bell24h/.env.production << 'EOF'

# MiniMax AI Configuration
MINIMAX_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MINIMAX_BASE_URL=https://api.minimax.chat/v1
MINIMAX_MODEL=abab6.5-chat
EOF

# Restart application
cd /var/www/bell24h
pm2 restart bell24h --update-env
```

---

## 🧪 Step 3: Test the Integration

### Test Voice RFQ Analysis

```bash
curl -X POST https://bell24h.com/api/rfqs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "voice",
    "fileUrl": "https://your-storage.com/sample-audio.webm",
    "userId": "user-id-here"
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "rfq": {
    "id": "...",
    "title": "Steel TMT Bars",
    "quantity": 500,
    "location": "Mumbai"
  },
  "analysis": {
    "productName": "Steel TMT Bars",
    "quantity": 500,
    "unit": "kg",
    "deliveryTimeline": "2 weeks",
    "location": "Mumbai",
    "confidence": 0.92
  }
}
```

### Test Video RFQ Analysis

```bash
curl -X POST https://bell24h.com/api/rfqs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "video",
    "fileUrl": "https://your-storage.com/sample-video.mp4",
    "userId": "user-id-here"
  }'
```

---

## 📊 Cost Estimation

### Example: 1000 Voice RFQs per day

| Activity | Tokens | Daily Cost |
|----------|--------|------------|
| Voice Transcription | ~500 tokens/RFQ | ₹12 |
| Data Extraction | ~300 tokens/RFQ | ₹7 |
| Smart Quote Generation (500 quotes) | ~1000 tokens/quote | ₹150 |
| Negotiation Conversations (100/day) | ~2000 tokens/convo | ₹60 |
| **Total Daily** | | **₹229** |
| **Total Monthly** | | **₹6,870** |

**Compare to Claude Sonnet 4.5**: Would cost ~₹86,000/month (12x more expensive!)

---

## 🛠️ Step 4: Update Voice RFQ Component

Modify `src/components/rfq/VoiceRFQForm.tsx`:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Upload audio to InsForge Storage
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from('voice-rfqs')
      .uploadAuto(audioFile);

    if (uploadError) throw uploadError;

    // 2. Send to MiniMax for analysis
    const response = await fetch('/api/rfqs/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'voice',
        fileUrl: uploadData.url,
        userId: user.id,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // 3. Show extracted data to user for confirmation
      setExtractedData(result.analysis);
      toast.success('Voice RFQ analyzed successfully!');

      // 4. Redirect to RFQ detail page
      router.push(`/dashboard/rfqs/${result.rfq.id}`);
    }

  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to process voice RFQ');
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 Step 5: Enable Smart Quote Feature

Add "Generate Smart Quote" button for suppliers:

```tsx
// In QuoteForm.tsx
const generateSmartQuote = async () => {
  const response = await fetch('/api/quotes/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rfqId: rfq.id,
      supplierId: user.id,
    }),
  });

  const { quote } = await response.json();

  // Auto-fill form fields
  setPrice(quote.quotedPrice);
  setDeliveryDays(quote.deliveryDays);
  setProposal(quote.proposalText);
};
```

---

## 🔐 Security Best Practices

1. **Never expose API key** in client-side code
2. **Use environment variables** only
3. **Validate user input** before sending to MiniMax
4. **Rate limit** API calls (max 100 requests/minute per user)
5. **Monitor usage** to prevent abuse

---

## 📈 Monitoring & Analytics

Track MiniMax usage in your dashboard:

```sql
-- Daily AI usage
SELECT
  DATE(created_at) as date,
  COUNT(*) as rfqs_analyzed,
  AVG(extracted_data->>'confidence') as avg_confidence
FROM rfqs
WHERE type IN ('voice', 'video')
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🎉 Success Criteria

- [ ] MiniMax API key added to environment
- [ ] Voice RFQ uploads and analyzes correctly
- [ ] Video RFQ extracts product details
- [ ] Smart Quote generation works
- [ ] Cost stays under ₹10,000/month
- [ ] Multilingual support tested (Hindi/Tamil/Telugu)

---

## 🆘 Troubleshooting

### Error: "Invalid API key"
- Check `.env` file has correct `MINIMAX_API_KEY`
- Ensure no extra spaces or quotes
- Restart server after adding key

### Error: "Rate limit exceeded"
- MiniMax free tier: 60 requests/minute
- Upgrade to paid plan for higher limits
- Implement request queuing

### Error: "Language not supported"
- MiniMax supports: English, Hindi, Tamil, Telugu, Marathi
- For other languages, use fallback to Google Translate

---

## 📞 Support

**MiniMax Support**: https://api.minimax.chat/docs
**Bell24h Support**: support@bell24h.com

---

## 💰 Pricing Plans

| Plan | Tokens/Month | Cost | Best For |
|------|--------------|------|----------|
| **Free** | 1M tokens | $0 | Testing |
| **Startup** | 100M tokens | $30 | Early stage |
| **Growth** | 1B tokens | $300 | Scale-up |
| **Enterprise** | Custom | Custom | Large scale |

**Recommendation for Bell24h**: Start with **Startup plan** (₹2,500/month)

---

Ready to implement! 🚀
