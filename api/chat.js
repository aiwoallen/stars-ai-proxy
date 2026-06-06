/**
 * 群星AI教育平台 - Vercel API代理
 * 将DeepSeek API密钥保存在服务端
 */
const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = 'sk-2293c70b623e4cfc96ce369d230a568d';
const SYSTEM_PROMPT = '你是群星AI教育平台的助手，帮助用户学习人工智能知识。回答简洁友好，适合学生阅读，字数控制在200字以内。';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 健康检查
  if (req.method === 'GET') {
    return res.json({ status: 'ok', service: '\u7FA4\u661F\u4EE3\u7406\u670D\u52A1\u5668' });
  }

  // 聊天接口
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, prompt } = req.body;
    const msg = (message || prompt || '').trim();

    if (!msg) return res.status(400).json({ error: '\u6D88\u606F\u4E0D\u80FD\u4E3A\u7A7A' });
    if (msg.length > 2000) return res.status(400).json({ error: '\u6D88\u606F\u8FC7\u957F' });

    const resp = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: msg }
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    if (!resp.ok) {
      const errMap = { 401: 'API\u5BC6\u94A5\u65E0\u6548', 429: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41', 402: 'API\u4F59\u989D\u4E0D\u8DB3' };
      return res.status(502).json({ error: errMap[resp.status] || `AI\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528(${resp.status})` });
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply || reply.length < 2) return res.status(502).json({ error: 'AI\u8FD4\u56DE\u4E3A\u7A7A' });

    return res.json({ reply });

  } catch (e) {
    return res.json({ reply: 'AI\u52A9\u624B\u6682\u65F6\u79BB\u7EBF\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002' });
  }
}
