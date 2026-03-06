import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-3a77dd249cbc4470bce28f21a61a6c8e";

const STYLE_PROMPTS: Record<string, string> = {
  zhongcao: `你是一位小红书种草文案专家。请根据用户提供的产品信息，生成5条种草安利风格的文案。

要求：
1. 标题要吸引眼球，使用emoji，控制在20字以内
2. 内容要有真实感，像朋友推荐一样自然
3. 突出产品卖点和用户痛点
4. 使用适当的emoji增加可读性
5. 结尾要有互动引导（点赞、收藏、评论）
6. 每条文案独立成段，风格略有不同

格式：每条文案用 "---" 分隔`,

  ganhuo: `你是一位小红书干货分享专家。请根据用户提供的产品或知识信息，生成5条干货分享风格的文案。

要求：
1. 标题要突出价值感，让人想收藏
2. 内容要有条理，使用序号或要点
3. 提供实用的技巧或方法
4. 语言简洁专业但不枯燥
5. 适当使用emoji增加可读性
6. 结尾引导收藏和关注

格式：每条文案用 "---" 分隔`,

  qinggan: `你是一位小红书情感文案专家。请根据用户提供的产品或故事背景，生成5条情感共鸣风格的文案。

要求：
1. 标题要有故事感或情感共鸣
2. 内容要有温度，像在讲故事
3. 能引发读者的情感共鸣
4. 语言自然真诚，不刻意煽情
5. 适当使用emoji增加氛围
6. 结尾引导互动和分享

格式：每条文案用 "---" 分隔`,
};

export async function POST(request: NextRequest) {
  try {
    const { product, style } = await request.json();

    if (!product || !style) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const systemPrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.zhongcao;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `产品/服务信息：${product}` },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("DeepSeek API error:", error);
      return NextResponse.json({ error: "AI 服务暂时不可用" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // 解析结果，按 "---" 分隔
    const results = content
      .split("---")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "生成失败，请稍后重试" }, { status: 500 });
  }
}
