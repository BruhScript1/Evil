export default async function handler(req, res) {
    // Autoriser CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Gérer preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Vérifier la méthode
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, channelId, content, embeds } = req.body;

    // Validation
    if (!token) {
        return res.status(400).json({ error: 'Bot token is required' });
    }

    if (!channelId) {
        return res.status(400).json({ error: 'Channel ID is required' });
    }

    if (!content && (!embeds || embeds.length === 0)) {
        return res.status(400).json({ error: 'Content or embeds required' });
    }

    try {
        // Construire le payload
        const payload = {};
        if (content) payload.content = content;
        if (embeds && embeds.length > 0) payload.embeds = embeds;

        // Envoyer à Discord
        const response = await fetch(
            `https://discord.com/api/v10/channels/${channelId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bot ${token}`
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.message || 'Discord API error',
                code: data.code
            });
        }

        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
