"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Space } from "@/lib/types";

// Tried in order. Safari (desktop + iOS) only supports the mp4/h264 entries —
// it has no webm encoder at all, so putting a webm-only browser first would
// throw before recording even starts. Chrome/Firefox/Android generally only
// support the webm entries. Whichever one the browser accepts is uploaded
// as-is; Cloudflare Stream transcodes it server-side into one format that
// plays back everywhere, so no single format has to work on every device.
const CANDIDATE_MIME_TYPES = [
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function pickSupportedMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

type Mode = "choose" | "text" | "record" | "reviewing" | "uploading" | "done";

export default function SubmitForm({ space }: { space: Space }) {
  const [mode, setMode] = useState<Mode>("choose");
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerTitle, setCustomerTitle] = useState("");
  const [contentText, setContentText] = useState("");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const supabase = createClient();

  const reviewUrl = useMemo(
    () => (recordedBlob ? URL.createObjectURL(recordedBlob) : null),
    [recordedBlob]
  );

  async function startRecording() {
    setError(null);
    const mimeType = pickSupportedMimeType();
    if (!mimeType) {
      setError(
        "This browser can't record video. Try a different browser, or send a text testimonial instead."
      );
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      setError(
        "Camera/microphone access was blocked. Allow permission in your browser, or send a text testimonial instead."
      );
      return;
    }

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      await videoRef.current.play().catch(() => {});
    }

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedBlob(blob);
      setRecordedMimeType(mimeType);
      stream.getTracks().forEach((t) => t.stop());
      setMode("reviewing");
    };

    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setMode("record");
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  function retake() {
    setRecordedBlob(null);
    setRecordedMimeType("");
    setMode("choose");
  }

  async function submitVideo() {
    if (!recordedBlob) return;
    setMode("uploading");
    setError(null);

    try {
      const res = await fetch(`/api/spaces/${space.slug}/upload-url`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not start upload");
      const { uploadURL, uid } = json as { uploadURL: string; uid: string };

      const extension = recordedMimeType.includes("mp4") ? "mp4" : "webm";
      const form = new FormData();
      form.append("file", recordedBlob, `testimonial.${extension}`);

      const uploadRes = await fetch(uploadURL, { method: "POST", body: form });
      if (!uploadRes.ok) throw new Error("Video upload failed, please try again");

      const { error: insertError } = await supabase.from("testimonials").insert({
        space_id: space.id,
        type: "video",
        customer_name: customerName || "Anonymous",
        customer_title: customerTitle || null,
        media_url: `stream:${uid}`,
      });
      if (insertError) throw insertError;

      setMode("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, please try again.");
      setMode("reviewing");
    }
  }

  async function submitText(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMode("uploading");
    try {
      const { error: insertError } = await supabase.from("testimonials").insert({
        space_id: space.id,
        type: "text",
        customer_name: customerName || "Anonymous",
        customer_title: customerTitle || null,
        content_text: contentText,
      });
      if (insertError) throw insertError;
      setMode("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, please try again.");
      setMode("text");
    }
  }

  if (mode === "done") {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Thank you!</h2>
        <p className="mt-2 text-slate-600">Your testimonial was submitted.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {mode === "choose" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Your name</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Title / company (optional)
            </label>
            <input
              value={customerTitle}
              onChange={(e) => setCustomerTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setMode("text")}
              className="flex-1 rounded-full border border-slate-300 px-4 py-2 font-medium hover:border-slate-400"
            >
              Write a testimonial
            </button>
            <button
              onClick={startRecording}
              className="flex-1 rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
            >
              Record a video
            </button>
          </div>
        </div>
      )}

      {mode === "text" && (
        <form onSubmit={submitText} className="space-y-4">
          <textarea
            required
            rows={5}
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder={space.question ?? "What do you love most about us?"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode("choose")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm hover:border-slate-400"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      {mode === "record" && (
        <div className="space-y-4">
          <video ref={videoRef} className="w-full rounded-lg bg-black" playsInline />
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className="w-full rounded-full bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
          >
            Stop recording
          </button>
        </div>
      )}

      {mode === "reviewing" && recordedBlob && reviewUrl && (
        <div className="space-y-4">
          <video
            src={reviewUrl}
            controls
            playsInline
            className="w-full rounded-lg bg-black"
          />
          <div className="flex gap-3">
            <button
              onClick={retake}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm hover:border-slate-400"
            >
              Retake
            </button>
            <button
              onClick={submitVideo}
              className="flex-1 rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
            >
              Submit video
            </button>
          </div>
        </div>
      )}

      {mode === "uploading" && (
        <p className="text-center text-slate-600">Submitting…</p>
      )}
    </div>
  );
}
