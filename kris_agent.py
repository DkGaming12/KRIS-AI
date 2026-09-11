import os
import json
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

# Konfigurasi OmniRoute API
api_key = os.getenv("VITE_OPENAI_API_KEY", "sk-2081394719b3c86c-bc01c3-e892cdcc")
base_url = os.getenv("VITE_OPENAI_BASE_URL", "http://localhost:20128/v1")

client = AsyncOpenAI(
    api_key=api_key,
    base_url=base_url
)

SYSTEM_PROMPT = """
Anda adalah Kris AI, pakar penulisan novel fiksi yang sangat membantu, kreatif, 
dan ahli dalam menyusun cerita, world building, dan penokohan.
Anda adalah 'Sastra Engine V6'.
Gunakan bahasa Indonesia yang baik, asertif namun bersahabat.
Anda kini dibekali kemampuan "Tools" (Agentic). Panggil tools yang relevan jika pengguna meminta:
1. Menyusun outline (generate_novel_outline)
2. Membuat/mendetailkan karakter (brainstorm_character)
"""

tools = [
    {
        "type": "function",
        "function": {
            "name": "generate_novel_outline",
            "description": "Menghasilkan kerangka (outline) novel berdasarkan premis.",
            "parameters": {
                "type": "object",
                "properties": {
                    "premise": {"type": "string", "description": "Premis cerita (ide utama)."},
                    "genre": {"type": "string", "description": "Genre novel (misal: Fantasy, Romance)."},
                    "target_chapters": {"type": "integer", "description": "Target jumlah bab."}
                },
                "required": ["premise", "genre", "target_chapters"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "brainstorm_character",
            "description": "Membuat profil detail untuk karakter novel (latar belakang, motivasi, konflik).",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Nama karakter."},
                    "role": {"type": "string", "description": "Peran dalam cerita (misal: Protagonis, Antagonis)."}
                },
                "required": ["name", "role"]
            }
        }
    }
]

def handle_tool_call(function_name, arguments):
    """Mengeksekusi alat (tool) secara lokal."""
    if function_name == "generate_novel_outline":
        return f"[Tool Response] Outline berhasil dibuat untuk genre {arguments.get('genre')} dengan {arguments.get('target_chapters')} bab. Premis: {arguments.get('premise')}."
    elif function_name == "brainstorm_character":
        return f"[Tool Response] Profil karakter {arguments.get('name')} ({arguments.get('role')}) berhasil dikembangkan dengan latar belakang tragis dan motivasi kuat."
    return f"Error: Tool {function_name} tidak ditemukan."

async def main():
    print("✦ Memulai Kris AI Agent (Sastra Engine V6) via OmniRoute...")
    print(f"Menggunakan endpoint: {base_url}\n")
    
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    print("Kris AI siap! Ketik 'exit' atau 'quit' untuk keluar.\n")

    while True:
        try:
            user_input = input("Anda: ")
            if user_input.lower() in ['exit', 'quit', 'q']:
                print("\nSampai jumpa! ✦")
                break
            if not user_input.strip():
                continue

            messages.append({"role": "user", "content": user_input})
            print("\nKris AI sedang berpikir...")
            
            response = await client.chat.completions.create(
                model="auto",
                messages=messages,
                tools=tools,
                temperature=0.7
            )
            
            response_message = response.choices[0].message
            messages.append(response_message)
            
            # Periksa apakah AI memanggil tool
            if response_message.tool_calls:
                for tool_call in response_message.tool_calls:
                    print(f"\n[!] Kris AI memutuskan untuk menggunakan alat: {tool_call.function.name}...")
                    
                    # Eksekusi tool
                    args = json.loads(tool_call.function.arguments)
                    tool_result = handle_tool_call(tool_call.function.name, args)
                    
                    # Berikan hasil tool kembali ke AI
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_call.function.name,
                        "content": tool_result
                    })
                
                # Biarkan AI merespons hasil tool
                final_response = await client.chat.completions.create(
                    model="auto",
                    messages=messages,
                )
                print(f"\nKris AI: {final_response.choices[0].message.content}\n")
                messages.append(final_response.choices[0].message)
            else:
                # Tidak ada panggilan tool
                print(f"\nKris AI: {response_message.content}\n")

        except Exception as e:
            print(f"\n[ERROR] Gagal memproses permintaan: {e}\n")

if __name__ == "__main__":
    asyncio.run(main())
