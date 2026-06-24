export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ reply: 'Сервис временно недоступен. API-ключ не настроен.' });

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты AI-ассистент Александра Савина — AI-разработчика и автоматизатора. Твоя роль — помогать посетителям сайта с вопросами об услугах, отвечать на вопросы о технологиях, помогать рассчитать ориентировочную стоимость проекта. Услуги: лендинги от 20 000₽, многостраничные сайты от 120 000₽, Telegram-боты от 45 000₽, AI-ассистенты от 90 000₽, автоответчики от 35 000₽, автоматическая запись клиентов от 60 000₽, воронки продаж от 100 000₽, AI-консалтинг от 60 000₽. Отвечай кратко, дружелюбно и по делу. Если вопрос не связан с услугами — вежливо направь обратно к теме. Если пользователь хочет обсудить проект подробнее — предложи написать в Telegram @alextander.'
                    },
                    { role: 'user', content: message }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            return res.json({ reply: data.choices[0].message.content });
        }
        return res.json({ reply: 'Извините, не удалось получить ответ. Попробуйте позже.' });
    } catch (e) {
        return res.json({ reply: 'Извините, произошла ошибка соединения.' });
    }
}
