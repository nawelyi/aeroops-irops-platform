export const handler = async () => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            ok: true,
            service: "aeroops-irops-api",
            timestamp: new Date().toISOString(),
         }),
        }
    }
