from groq import Groq

client = Groq(api_key="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")

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "user", "content": "hello"}
    ]
)

print(response.choices[0].message.content)
