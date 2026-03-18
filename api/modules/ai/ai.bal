// ─────────────────────────────────────────────────────────────────────────────
// ai.bal — HuggingFace Inference API helpers.
// Sub-module: import brainlabs/backend.ai;
// ─────────────────────────────────────────────────────────────────────────────
import ballerina/http;
import ballerina/log;

final http:Client hfClient = check new ("https://api-inference.huggingface.co");

// ─── Internal HuggingFace response record types ──────────────────────────────
type HfSummarizationItem record {
    string summary_text;
};

type HfZeroShotResult record {
    string sequence;
    string[] labels;
    float[] scores;
};

// ─── BART-large-CNN: text summarisation ──────────────────────────────────────
public function summarize(string text, string token) returns string|error {
    if token == "" {
        return "AI summarisation not configured. Add hfToken to Config.toml.";
    }
    json body = {
        inputs:     text,
        parameters: {max_length: 150, min_length: 40, do_sample: false}
    };
    http:Response resp = check hfClient->post(
        "/models/facebook/bart-large-cnn", body,
        {"Authorization": "Bearer " + token, "Content-Type": "application/json"}
    );
    if resp.statusCode == 503 {
        return "Model loading, please retry in a few seconds.";
    }
    if resp.statusCode != 200 {
        string errBody = check resp.getTextPayload();
        log:printWarn("HF summarize error", status = resp.statusCode, body = errBody);
        return "Summarisation service unavailable (" + resp.statusCode.toString() + ").";
    }
    json result = check resp.getJsonPayload();
    HfSummarizationItem[] items = check result.cloneWithType();
    return items.length() > 0 ? items[0].summary_text : "";
}

// ─── BART-large-MNLI: zero-shot research area classification ─────────────────
public function classifyResearchArea(string text, string token) returns string|error {
    if token == "" {
        return "Large Language Models";
    }
    json body = {
        inputs:     text,
        parameters: {
            candidate_labels: [
                "Large Language Models",
                "Neuromorphic Computing",
                "Spiking Neural Networks",
                "AI Security",
                "Neuroscience and Health"
            ]
        }
    };
    http:Response resp = check hfClient->post(
        "/models/facebook/bart-large-mnli", body,
        {"Authorization": "Bearer " + token, "Content-Type": "application/json"}
    );
    if resp.statusCode != 200 {
        log:printWarn("HF classify error", status = resp.statusCode);
        return "Uncategorized";
    }
    json result = check resp.getJsonPayload();
    HfZeroShotResult zsr = check result.cloneWithType(HfZeroShotResult);
    return zsr.labels.length() > 0 ? zsr.labels[0] : "Uncategorized";
}

// ─── BART-large-MNLI: zero-shot tag suggestions ─────────────────────────────
public function autoTag(string text, string[] candidates, string token)
        returns string[]|error {
    if token == "" {
        return [];
    }
    json body = {inputs: text, parameters: {candidate_labels: candidates}};
    http:Response resp = check hfClient->post(
        "/models/facebook/bart-large-mnli", body,
        {"Authorization": "Bearer " + token, "Content-Type": "application/json"}
    );
    if resp.statusCode != 200 {
        return [];
    }
    json result = check resp.getJsonPayload();
    HfZeroShotResult zsr = check result.cloneWithType(HfZeroShotResult);
    string[] selected = [];
    foreach int i in 0 ..< zsr.labels.length() {
        if i >= zsr.scores.length() { break; }
        if zsr.scores[i] > 0.3 && selected.length() < 3 {
            selected.push(zsr.labels[i]);
        }
    }
    return selected;
}
