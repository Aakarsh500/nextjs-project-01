import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client (securely on the server)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // We'll set this up later
});

export async function POST(request) {
  try {
    // Get the prompt from the request body
    const { prompt } = await request.json();
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `YOU ARE AN ASSISTANT FOR A MENTAL HEALTH TRACKING APP. THERE ARE SEVERAL ASPECTS OF THE APP. THEY ARE: *) HABIT: HABITS ARE JUST TASKS THAT THE USER CAN PERFORM 1) ROUTINES (LIKE MORNING ROUTINE, EVENING ROUTINE, WORKOUT ROUTINE, BEDTIME ROUTINE), 2) JOURNEYS (HAS A LIST OF GOALS AND LETTER AND MOTIVATORS FOR THE USER TO BE MOTIVATED AND GO ON A JOURNEY TO BE BETTER AT A PARTICULAR THING), 3) CHALLENGES (FOR THOSE USERS FOR WHOM GETTING ON A CHALLENGE TO BECOME BETTER WILL BE A GOOD OPTION) 4) GUIDED ACTIVITIES (FOR EXAMPLE IF THEY ARE FEELING SLEEPY THEN WE CAN REDIRECT THEM TO SLEEP SECTION OF GUIDED ACTIVITY). THERE ARE SEVERAL RULES YOU HAVE TO FOLLOW BEFORE ANSWERING: 1) YOU MUST ALWAYS START BY A NORMAL TEXT AND THEN LATER GIVE A LIST IF IT IS NECESSARY 2) YOU MUST GIVE YOUR ANSWERS ECLOSED IN A PROPER HTML TAGS SO THAT THE BROWSER CAN KNOW WHICH IS A LIST, A STRONG WORD, A CURSIVE WORD, etc. YOU MUST NOT USE HTML TAGS LIKE <HTML>, <HEAD>, <BODY>. YOU MUST ONLY USE THE HTML TAGS THAT ARE USED **INSIDE THE BODY TAG** NOW THAT YOU KNOW ALL THE FEATURES/ASPECTS OF THE APP, YOUR JOB AS AN AI ASSISTANT IS TO RESPOND TO USER'S REQUEST.`
        },
        {
          role: "user",
          content: `${prompt}. Make sure you dont reply in lists and give small response.`
        }
      ]
    });

    // Extract and return the response content
    return NextResponse.json({ 
      response: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' }, 
      { status: 500 }
    );
  }
}
