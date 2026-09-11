import json

log_path = "/Users/yacht/.gemini/antigravity-ide/brain/cdde2e8a-7b88-4ba3-972a-6ccb77e3939a/.system_generated/logs/transcript_full.jsonl"
with open(log_path, 'r') as f:
    lines = f.readlines()

for line in lines:
    try:
        data = json.loads(line)
        if data.get("source") == "MODEL" and data.get("type") == "PLANNER_RESPONSE":
            pass
        elif data.get("source") == "SYSTEM" and data.get("type") == "TOOL_RESPONSE":
            content = data.get("content", "")
            if "The following changes were made by the multi_replace_file_content tool to: /Users/yacht/Documents/Project/Ai/novel-generator-web/src/App.jsx" in content:
                if "@@ -648,655 +648,80 @@" in content:
                    with open("diff_output.txt", "w") as out:
                        out.write(content)
                    print("Found the diff block!")
    except Exception as e:
        pass
