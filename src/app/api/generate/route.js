import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    const requestBody = { message_type: "text", message: prompt };
    
    const response = await fetch('https://chatbot-starter.onrender.com/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NDFhN2QyYi1jOGQzLTQ3MTYtYTc2Ni1lZmVmYjBiMWNiNjIiLCJ0eXBlIjoidXNlciIsImV4cCI6MTc0MTIxMzU5Mn0.7OHZxDQJMgOcoEhFioJvqlvBJbGXK8afiK60SAmRvyA'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error('Failed to generate response');

    // Directly pipe the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}