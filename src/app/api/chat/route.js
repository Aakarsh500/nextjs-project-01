import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message_type, message } = await req.json();
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Forward the request to the actual chat endpoint
    const response = await fetch('https://chatbot-starter.onrender.com/chat/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message_type: message_type,
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}: ${await response.text()}`);
    }
    
    // Direct streaming from the AI service to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
