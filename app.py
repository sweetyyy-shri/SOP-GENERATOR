from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "Backend is running!"})


@app.route("/api/generate-sop", methods=["POST"])
def generate_sop():
    data = request.get_json(silent=True) or {}

    department = data.get("department", "").strip()
    process = data.get("process", "").strip()
    description = data.get("description", "").strip()

    if not department or not process or not description:
        return jsonify({
            "error": "Please provide department, process, and description."
        }), 400

    sop = {
        "title": f"SOP: {process}",
        "objective": (
            f"To standardize the {process} process "
            f"within the {department} department."
        ),
        "scope": (
            f"This procedure covers activities related to {process} "
            f"in the {department} department."
        ),
        "roles": [
            f"{department} team: Perform the assigned activities.",
            "Supervisor: Review the process and verify completion."
        ],
        "steps": [
            f"Step 1: Review the requirements for {process}.",
            f"Step 2: Prepare the resources needed for {process}.",
            f"Step 3: Follow the process description: {description}",
            "Step 4: Check the completed work for errors.",
            "Step 5: Record the results and report any issues.",
            "Step 6: Obtain supervisor approval where required."
        ],
        "checklist": [
            "Requirements have been reviewed.",
            "Required resources are available.",
            "The process has been completed.",
            "Results have been checked.",
            "Records have been updated."
        ],
        "workflow": [
            "Start",
            "Review requirements",
            "Prepare resources",
            "Execute process",
            "Verify results",
            "Document completion",
            "End"
        ],
        "review_note": (
            "Template-generated draft. Verify all steps, responsibilities, "
            "and safety requirements with the relevant department before use."
        )
    }

    return jsonify(sop)


if __name__ == "__main__":
    app.run(debug=True, port=5000)