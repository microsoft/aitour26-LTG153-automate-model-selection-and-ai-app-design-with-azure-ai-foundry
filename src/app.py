from flask import Flask, jsonify, request, send_from_directory
import json
import os
from pathlib import Path
from openai import AzureOpenAI
from dotenv import load_dotenv
import time

load_dotenv()

app = Flask(__name__, static_folder='dist', static_url_path='')

# Load scenario data from JSON
data_path = Path(__file__).parent / "data" / "scenarios.json"
scenarios_data = {}
if data_path.exists():
    with open(data_path, "r", encoding="utf-8") as f:
        scenarios_data = json.load(f)

def augment_prompt_with_context(prompt_text):
    """
    Check if the prompt matches a scenario and augment with RAG data if available
    """
    # Find matching scenario by comparing prompt text
    for dept_scenarios in scenarios_data.values():
        for scenario in dept_scenarios:
            if scenario["prompt"] == prompt_text:
                # Found matching scenario, load context data if available
                if scenario.get("source_data_file"):
                    try:
                        context_file_path = Path(__file__).parent / "data" / "scenario_source_data" / scenario["source_data_file"]
                        if context_file_path.exists():
                            with open(context_file_path, "r", encoding="utf-8") as f:
                                context_data = f.read()
                            return f"{prompt_text}\n\nContext Data:\n{context_data}"
                    except Exception as e:
                        print(f"Error loading context data: {e}")
                break
    return prompt_text

@app.route('/')
def index():
    return send_from_directory('dist', 'index.html')

@app.route('/api/scenarios/<department>')
def get_scenarios(department):
    return jsonify(scenarios_data.get(department, []))

@app.route('/api/scenario/<scenario_id>')
def get_scenario_detail(scenario_id):
    for dept in scenarios_data.values():
        for scenario in dept:
            if scenario["id"] == scenario_id:
                return jsonify(scenario)
    return jsonify({"error": "Scenario not found"}), 404

@app.route('/api/route', methods=['POST'])
def route_prompt():
    prompt_data = request.get_json()
    prompt_text = prompt_data.get('prompt', '')

    if not prompt_text:
        return jsonify({"error": "Prompt is required"}), 400

    # Augment prompt with RAG context data if available
    augmented_prompt = augment_prompt_with_context(prompt_text)

    # Measure server-side processing time
    server_start = time.perf_counter()

    # Check if Azure credentials are configured
    if all([os.getenv("AZURE_OPENAI_ENDPOINT"), os.getenv("AZURE_OPENAI_API_KEY"), os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")]):
        try:
            # Initialize Azure OpenAI Client inside the block
            client = AzureOpenAI(
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-05-01-preview"),
            )
            deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

            # Call the Azure OpenAI model router
            response = client.chat.completions.create(
                model=deployment_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": augmented_prompt},
                ],
            )

            # Extract real data from the response
            model_used = response.model
            output_text = response.choices[0].message.content
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            total_tokens = response.usage.total_tokens

            server_end = time.perf_counter()
            server_processing_ms = int((server_end - server_start) * 1000)

            return jsonify({
                "model_type": model_used,
                "output": output_text,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
                "server_processing_ms": server_processing_ms,
            })

        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        # Fallback to mock logic if credentials are not set
        model_type = "Mock Lightweight"
        output = "This is a basic mock response (Azure credentials not configured)."
        prompt_tokens = len(augmented_prompt.split())
        completion_tokens = 25
        
        if "analyze" in augmented_prompt.lower() or "compare" in augmented_prompt.lower() or "review" in augmented_prompt.lower():
            model_type = "Mock Standard"
            output = "This is a more detailed mock analysis (Azure credentials not configured)."
            completion_tokens = 75
        
        if "forecast" in prompt_text.lower() or "predict" in prompt_text.lower() or "generate strategy" in prompt_text.lower():
            model_type = "Mock Premium"
            output = "This is a comprehensive mock forecast (Azure credentials not configured)."
            completion_tokens = 200

        total_tokens = prompt_tokens + completion_tokens

        server_end = time.perf_counter()
        server_processing_ms = int((server_end - server_start) * 1000)

        return jsonify({
            "model_type": model_type,
            "output": output,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "server_processing_ms": server_processing_ms,
        })

@app.route('/api/route-comparison', methods=['POST'])
def route_comparison():
    prompt_data = request.get_json()
    prompt_text = prompt_data.get('prompt', '')

    if not prompt_text:
        return jsonify({"error": "Prompt is required"}), 400

    # Check if both router and benchmark credentials are configured
    router_configured = all([
        os.getenv("AZURE_OPENAI_ENDPOINT"), 
        os.getenv("AZURE_OPENAI_API_KEY"), 
        os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
    ])
    
    benchmark_configured = all([
        os.getenv("AZURE_OPENAI_BENCHMARK_ENDPOINT"), 
        os.getenv("AZURE_OPENAI_BENCHMARK_API_KEY"), 
        os.getenv("AZURE_OPENAI_BENCHMARK_DEPLOYMENT_NAME")
    ])

    results = {"router": None, "benchmark": None}

    # Get Model Router response
    if router_configured:
        try:
            router_client = AzureOpenAI(
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-05-01-preview"),
            )
            router_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

            router_response = router_client.chat.completions.create(
                model=router_deployment,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt_text},
                ],
            )

            results["router"] = {
                "model_type": router_response.model,
                "output": router_response.choices[0].message.content,
                "prompt_tokens": router_response.usage.prompt_tokens,
                "completion_tokens": router_response.usage.completion_tokens,
                "total_tokens": router_response.usage.total_tokens,
            }
        except Exception as e:
            results["router"] = {"error": str(e)}
    else:
        # Mock router response
        prompt_tokens = len(prompt_text.split())
        if "analyze" in prompt_text.lower() or "compare" in prompt_text.lower():
            results["router"] = {
                "model_type": "Mock Standard",
                "output": "This is a detailed mock analysis from the Model Router (Azure credentials not configured).",
                "prompt_tokens": prompt_tokens,
                "completion_tokens": 75,
                "total_tokens": prompt_tokens + 75,
            }
        elif "forecast" in prompt_text.lower() or "predict" in prompt_text.lower():
            results["router"] = {
                "model_type": "Mock Premium",
                "output": "This is a comprehensive mock forecast from the Model Router (Azure credentials not configured).",
                "prompt_tokens": prompt_tokens,
                "completion_tokens": 200,
                "total_tokens": prompt_tokens + 200,
            }
        else:
            results["router"] = {
                "model_type": "Mock Lightweight",
                "output": "This is a basic mock response from the Model Router (Azure credentials not configured).",
                "prompt_tokens": prompt_tokens,
                "completion_tokens": 25,
                "total_tokens": prompt_tokens + 25,
            }

    # Get Benchmark model response  
    if benchmark_configured:
        try:
            benchmark_client = AzureOpenAI(
                azure_endpoint=os.getenv("AZURE_OPENAI_BENCHMARK_ENDPOINT"),
                api_key=os.getenv("AZURE_OPENAI_BENCHMARK_API_KEY"),
                api_version=os.getenv("AZURE_OPENAI_BENCHMARK_API_VERSION", "2024-05-01-preview"),
            )
            benchmark_deployment = os.getenv("AZURE_OPENAI_BENCHMARK_DEPLOYMENT_NAME")

            benchmark_response = benchmark_client.chat.completions.create(
                model=benchmark_deployment,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt_text},
                ],
            )

            results["benchmark"] = {
                "model_type": benchmark_response.model,
                "output": benchmark_response.choices[0].message.content,
                "prompt_tokens": benchmark_response.usage.prompt_tokens,
                "completion_tokens": benchmark_response.usage.completion_tokens,
                "total_tokens": benchmark_response.usage.total_tokens,
            }
        except Exception as e:
            results["benchmark"] = {"error": str(e)}
    else:
        # Mock benchmark response (always high-quality/premium)
        prompt_tokens = len(prompt_text.split())
        results["benchmark"] = {
            "model_type": "Mock GPT-5 Benchmark",
            "output": "This is a high-quality benchmark response from the premium model (Azure credentials not configured). This response demonstrates the quality standard we're comparing against.",
            "prompt_tokens": prompt_tokens,
            "completion_tokens": 150,
            "total_tokens": prompt_tokens + 150,
        }

    return jsonify(results)


@app.route('/api/benchmark', methods=['POST'])
def benchmark_only():
    prompt_data = request.get_json()
    prompt_text = prompt_data.get('prompt', '')

    if not prompt_text:
        return jsonify({"error": "Prompt is required"}), 400

    # Augment prompt with RAG context data if available
    augmented_prompt = augment_prompt_with_context(prompt_text)

    # Measure server-side processing time
    server_start = time.perf_counter()

    benchmark_configured = all([
        os.getenv("AZURE_OPENAI_BENCHMARK_ENDPOINT"),
        os.getenv("AZURE_OPENAI_BENCHMARK_API_KEY"),
        os.getenv("AZURE_OPENAI_BENCHMARK_DEPLOYMENT_NAME")
    ])

    # Get Benchmark model response
    if benchmark_configured:
        try:
            benchmark_client = AzureOpenAI(
                azure_endpoint=os.getenv("AZURE_OPENAI_BENCHMARK_ENDPOINT"),
                api_key=os.getenv("AZURE_OPENAI_BENCHMARK_API_KEY"),
                api_version=os.getenv("AZURE_OPENAI_BENCHMARK_API_VERSION", "2024-05-01-preview"),
            )
            benchmark_deployment = os.getenv("AZURE_OPENAI_BENCHMARK_DEPLOYMENT_NAME")

            benchmark_response = benchmark_client.chat.completions.create(
                model=benchmark_deployment,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": augmented_prompt},
                ],
            )

            prompt_tokens = benchmark_response.usage.prompt_tokens
            completion_tokens = benchmark_response.usage.completion_tokens
            total_tokens = benchmark_response.usage.total_tokens

            server_end = time.perf_counter()
            server_processing_ms = int((server_end - server_start) * 1000)

            return jsonify({
                "model_type": benchmark_response.model,
                "output": benchmark_response.choices[0].message.content,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
                "server_processing_ms": server_processing_ms,
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        # Mock benchmark response (always high-quality/premium)
        prompt_tokens = len(augmented_prompt.split())
        completion_tokens = 150
        total_tokens = prompt_tokens + completion_tokens

        server_end = time.perf_counter()
        server_processing_ms = int((server_end - server_start) * 1000)

        return jsonify({
            "model_type": "Mock GPT-5 Benchmark",
            "output": "This is a high-quality benchmark response from the premium model (Azure credentials not configured). This response demonstrates the quality standard we're comparing against.",
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "server_processing_ms": server_processing_ms,
        })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
